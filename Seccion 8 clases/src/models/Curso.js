const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Curso = sequelize.define('Curso', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },

    codigo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    creditos: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Curso;