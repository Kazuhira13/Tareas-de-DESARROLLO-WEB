const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

const cursoController = require('../controllers/cursoController');
const authJWT = require('../middleware/authJWT');

router.get('/cursos', cursoController.obtenerCursos);

router.post(
    '/cursos',
    authJWT,

    [
        body('nombre')
            .notEmpty()
            .withMessage('El nombre es obligatorio'),

        body('codigo')
            .notEmpty()
            .withMessage('El código es obligatorio'),

        body('creditos')
            .isInt({ min: 1 })
            .withMessage('Los créditos deben ser un número entero')
    ],

    (req, res, next) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.status(400).json({
                errores: errores.array()
            });
        }

        next();
    },

    cursoController.crearCurso
);

module.exports = router;