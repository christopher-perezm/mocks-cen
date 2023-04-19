const cron = require('node-cron');
const {ForecastDemand} = require('../models/demand-forecast.model');
const moment = require('moment-timezone');

const generateAndInsertDemandForecast = async () => {
    const now = moment().tz('America/Santiago');
    const yesterday = now.clone().subtract(1, 'day');
    const tomorrow = now.clone().add(1, 'day');

    const dates = [yesterday, now, tomorrow];

    for (const date of dates) {
        const data = generateData(date);
        await insertData(date, data);
    }
};
const generateData = (date) => {
    const data = [];

    for (let i = 1; i <= 24; i++) {
        let demanda = 7600 + (Math.random() * 2300);
        data.push({fecha: date, hora: i, demanda});
    }

    return data;
};

const insertData = async (fecha, data) => {
    try {
        const result = await ForecastDemand.count({
            where: {
                fecha: fecha.format('YYYY-MM-DD'),
            },
            raw: true,
        });

        if (result === 0) {
            const promises = data.map(async (item) => {
                await ForecastDemand.create({
                    fecha: item.fecha.format('YYYY-MM-DD'),
                    hora: item.hora,
                    demanda: item.demanda
                });
            });
            await Promise.all(promises);
            console.log('Datos generados e insertados exitosamente');
        }
    } catch (err) {
        console.error('Error al insertar datos:', err);
    }
};

const forecastDemandJob = cron.schedule('0 0 * * *', async () => {
    const fecha = moment.tz('America/Santiago');
    console.log("> Inicio Job demanda pronosticada hora, " + fecha.format("YYYY-mm-DD HH:mm:SS"));
    await generateAndInsertDemandForecast();
    console.log("> Fin Job demanda pronosticada hora");
});

module.exports = {forecastDemandJob: forecastDemandJob, generateAndInsertDemandForecast};
