const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/sequelize.config');
const demandRouter = require('./routes/demand.route');
const generationRouter = require('./routes/generation.route');
const {generationJob, generateAndInsertGxErv} = require('./cronjobs/forecast-generation.job');
const {
    generateAndInsertGxRealToday, generateAndInsertGxReal,
    realGenerationJobToday, realGenerationJob
} = require('./cronjobs/real-generation.job');
const {forecastDemandJob, generateAndInsertDemandForecast} = require('./cronjobs/forecast-demand.job');
const {
    generateAndInsertDemandaReal, generateAndInsertDemandRealToday,
    realDemandJob, realDemandJobToday
} = require('./cronjobs/real-demand.job');
const moment = require('moment-timezone');

const app = express();
moment.tz.setDefault('America/Santiago');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Rutas
app.use('/', demandRouter);
app.use('/', generationRouter);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
sequelize
    .sync()
    .then(() => {
        console.log('Conexión establecida con la base de datos');
        app.listen(PORT, () => {
            generateAndInsertGxRealToday().then(r => r);
            generateAndInsertDemandRealToday().then(r => r);
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Error al conectar con la base de datos:', err);
    });

// Cronjob
generationJob.start();
realGenerationJob.start();
realGenerationJobToday.start();
forecastDemandJob.start();
realDemandJob.start();
realDemandJobToday.start();
