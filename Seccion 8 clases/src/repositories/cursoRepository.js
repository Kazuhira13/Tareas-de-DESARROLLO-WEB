const Curso = require('../models/Curso');

const obtenerCursos = async () => {
    return await Curso.findAll();
};

const crearCurso = async (datos) => {
    return await Curso.create(datos);
};

module.exports = {
    obtenerCursos,
    crearCurso
};