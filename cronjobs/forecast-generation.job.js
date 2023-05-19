const cron = require('node-cron');
const {GenerationForecast} = require('../models/generation-forecast.model');
const moment = require('moment-timezone');

const generateAndInsertGxErv = async () => {
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
    let tecnologia = 'Solar';

    for (let i = 1; i <= 24; i++) {
        let generacion = 0.1;
        if (i < 7 || i >= 18) {
            generacion = Math.random() * 2;
        } else if (i < 18) {
            generacion = 700 + (Math.random() * 4000);
        }
        data.push({fecha: date, hora: i, generacion, tecnologia});
    }

    tecnologia = 'Eólica';
    for (let i = 1; i <= 24; i++) {
        let generacion = 900 + Math.random() * 1100;
        data.push({fecha: date, hora: i, generacion, tecnologia});
    }

    tecnologia = 'Pasada';
    for (let i = 1; i <= 24; i++) {
        let generacion = 650 + Math.random() * 900;
        data.push({fecha: date, hora: i, generacion, tecnologia});
    }

    return data;
};

const insertData = async (fecha, data) => {
    try {
        const result = await GenerationForecast.count({
            where: {
                fecha: fecha.format('YYYY-MM-DD'),
            },
            raw: true,
        });

        if (result === 0) {
            const promises = data.map(async (item) => {
                await GenerationForecast.create({
                    fecha: item.fecha.format('YYYY-MM-DD'),
                    hora: item.hora,
                    generacion: item.generacion,
                    tecnologia: item.tecnologia,
                });
            });
            await Promise.all(promises);
            console.log('Datos generados e insertados exitosamente');
        }
    } catch (err) {
        console.error('Error al insertar datos:', err);
    }
};

const forecastGenerationJob = cron.schedule('0 0 * * *', async () => {
    const fecha = moment.tz('America/Santiago');
    console.log("> Inicio Job generacion pronosticada hora, " + fecha.format("YYYY-mm-DD HH:mm:SS"));
    await generateAndInsertGxErv();
    console.log("> Fin Job generacion pronosticada hora");
});

module.exports = {generationJob: forecastGenerationJob, generateAndInsertGxErv};
