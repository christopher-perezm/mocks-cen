const cron = require('node-cron');
const {ForecastDemand} = require('../models/demand-forecast.model');

const generateAndInsertDemandForecast = async () => {
    const now = new Date();
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const dates = [yesterday, now, tomorrow];

    for (const date of dates) {
        const data = generateData(date);
        await insertData(date, data);
    }
};
const generateData = (date) => {
    const data = [];

    for (let i = 1; i <= 24; i++) {
        const fecha = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        let demanda = 7600 + (Math.random() * 2300);
        data.push({fecha, hora: i, demanda});
    }

    return data;
};

const insertData = async (fecha, data) => {
    try {
        const result = await ForecastDemand.count({
            where: {
                fecha: fecha,
            },
            raw: true,
        });

        if (result === 0) {
            const promises = data.map(async (item) => {
                await ForecastDemand.create({
                    fecha: item.fecha,
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
    await generateAndInsertDemandForecast();
});

module.exports = {forecastDemandJob: forecastDemandJob, generateAndInsertDemandForecast};
