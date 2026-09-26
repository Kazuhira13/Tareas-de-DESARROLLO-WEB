const express = require('express');
const sequelize = require('./config/database');

const cursoRoutes = require('./routes/cursoRoutes');

const app = express();

app.use(express.json());

app.use(cursoRoutes);

sequelize.sync()
    .then(() => {
        console.log('Base de datos sincronizada');

        app.listen(3000, () => {
            console.log('Servidor corriendo en http://localhost:3000');
        });
    })
    .catch((error) => {
        console.error('Error al conectar con la base de datos:', error);
    });