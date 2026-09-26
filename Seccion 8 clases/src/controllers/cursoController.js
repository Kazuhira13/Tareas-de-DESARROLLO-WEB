const cursoRepository = require('../repositories/cursoRepository');

const obtenerCursos = async (req, res) => {
    try {
        const cursos = await cursoRepository.obtenerCursos();
        res.json(cursos);
    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener los cursos'
        });
    }
};

const crearCurso = async (req, res) => {
    try {
        const curso = await cursoRepository.crearCurso(req.body);
        res.status(201).json(curso);
    } catch (error) {
        res.status(500).json({
            error: 'Error al crear el curso'
        });
    }
};

module.exports = {
    obtenerCursos,
    crearCurso
};