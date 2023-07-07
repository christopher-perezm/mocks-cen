const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/sequelize.config');
const demandRouter = require('./routes/demand.route');
const generationRouter = require('./routes/generation.route');
const {
    generationJob,
    generateAndInsertGxErvDate
} = require('./cronjobs/forecast-generation.job');
const {
    realGenerationJobToday, realGenerationJob, generateAndInsertGxRealDate
} = require('./cronjobs/real-generation.job');
const {
    forecastDemandJob,
    generateAndInsertDemandForecastDate
} = require('./cronjobs/forecast-demand.job');
const {
    realDemandJob, realDemandJobToday, generateAndInsertDemandRealDate
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
        app.listen(PORT, async () => {
            const now = moment().tz('America/Santiago');
            const today = now.clone().startOf('day');
            const yesterday = today.clone().subtract(1, 'day');
            const tomorrow = today.clone().add(1, 'day');

            const hour = parseInt(now.format('H'));

            await generateAndInsertGxRealDate(yesterday).then(r => r);
            await generateAndInsertGxRealDate(today, hour).then(r => r);

            await generateAndInsertGxErvDate(yesterday).then(r => r);
            await generateAndInsertGxErvDate(today).then(r => r);
            await generateAndInsertGxErvDate(tomorrow).then(r => r);

            await generateAndInsertDemandRealDate(yesterday).then(r => r);
            await generateAndInsertDemandRealDate(today, hour).then(r => r);

            await generateAndInsertDemandForecastDate(yesterday).then(r => r);
            await generateAndInsertDemandForecastDate(today).then(r => r);
            await generateAndInsertDemandForecastDate(tomorrow).then(r => r);

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
