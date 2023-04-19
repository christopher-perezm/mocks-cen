const cron = require('node-cron');
const moment = require('moment-timezone');
const {GenerationReal} = require('../models/generation-real.model');

const generateAndInsertGxReal = async () => {
    const santiagoTime = moment().tz('America/Santiago');
    const yesterday = santiagoTime.clone().subtract(1, 'day');
    const twoDaysAgo = santiagoTime.clone().subtract(2, 'day');
    const dates = [yesterday, twoDaysAgo];

    for (const date of dates) {
        const data = generateData(date.toDate(), 24);
        await insertData(date, data);
    }
};

const generateAndInsertGxRealToday = async () => {
    const santiagoTime = moment().tz('America/Santiago');
    const hour = parseInt(santiagoTime.format('H'));

    const data = generateData(santiagoTime.toDate(), hour === 0 ? 24 : hour);
    await insertDataToday(data);
};
const generateData = (date, limit) => {
    const data = [];
    let tecnologia = 'Solar';

    for (let i = 1; i <= limit; i++) {
        const fecha = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        let generacion = 0.15;
        if (i < 7 || i >= 18) {
            generacion = Math.random() * 2;
        } else if (i < 18) {
            generacion = 705 + (Math.random() * 4020);
        }
        data.push({fecha, hora: i, generacion, tecnologia});
    }

    tecnologia = 'Eólica';
    for (let i = 1; i <= limit; i++) {
        const fecha = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        let generacion = 850 + Math.random() * 1300;
        data.push({fecha, hora: i, generacion, tecnologia});
    }

    return data;
};

const insertData = async (fecha, data) => {
    try {
        const result = await GenerationReal.count({
            where: {
                fecha: fecha,
            },
            raw: true,
        });

        if (result === 0) {
            const promises = data.map(async (item) => {
                await GenerationReal.create({
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

const insertDataToday = async (data) => {
    try {
        let inserts = false;
        const promises = data.map(async (item) => {
            const result = await GenerationReal.count({
                where: {
                    fecha: item.fecha,
                    hora: item.hora,
                    tecnologia: item.tecnologia,
                },
                raw: true,
            });

            if (result === 0) {
                inserts = true;
                await GenerationReal.create({
                    fecha: item.fecha,
                    hora: item.hora,
                    generacion: item.generacion,
                    tecnologia: item.tecnologia,
                });
            }
        });

        await Promise.all(promises);
        if (inserts) {
            console.log('Datos generados e insertados exitosamente');
        }
    } catch (err) {
        console.error('Error al insertar datos:', err);
    }
};

const realGenerationJob = cron.schedule('0 2 * * *', async () => {
    await generateAndInsertGxReal();
});

const realGenerationJobToday = cron.schedule('0 3 * * * *', async () => {
    await generateAndInsertGxRealToday();
});

module.exports = {
    realGenerationJob: realGenerationJob, realGenerationJobToday: realGenerationJobToday,
    generateAndInsertGxReal, generateAndInsertGxRealToday
};
