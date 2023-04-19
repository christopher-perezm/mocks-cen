const cron = require('node-cron');
const {GenerationForecast} = require('../models/generation-forecast.model');

const generateAndInsertGxErv = async () => {
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
    let tecnologia = 'Solar';

    for (let i = 1; i <= 24; i++) {
        const fecha = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        let generacion = 0.1;
        if (i < 7 || i >= 18) {
            generacion = Math.random() * 2;
        } else if (i < 18) {
            generacion = 700 + (Math.random() * 4000);
        }
        data.push({fecha, hora: i, generacion, tecnologia});
    }

    tecnologia = 'Eólica';
    for (let i = 1; i <= 24; i++) {
        const fecha = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        let generacion = 900 + Math.random() * 1100;
        data.push({fecha, hora: i, generacion, tecnologia});
    }

    return data;
};

const insertData = async (fecha, data) => {
    try {
        const result = await GenerationForecast.count({
            where: {
                fecha: fecha,
            },
            raw: true,
        });

        if (result === 0) {
            const promises = data.map(async (item) => {
                await GenerationForecast.create({
                    fecha: item.fecha,
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
    await generateAndInsertGxErv();
});

module.exports = {generationJob: forecastGenerationJob, generateAndInsertGxErv};
