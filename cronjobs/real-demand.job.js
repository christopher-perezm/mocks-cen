const cron = require('node-cron');
const moment = require('moment-timezone');
const {RealDemand} = require('../models/demand-real.model');

const generateAndInsertDemandaReal = async () => {
    const santiagoTime = moment().tz('America/Santiago');
    const yesterday = santiagoTime.clone().subtract(1, 'day');
    const twoDaysAgo = santiagoTime.clone().subtract(2, 'day');
    const dates = [yesterday, twoDaysAgo];

    for (const date of dates) {
        const data = generateData(date.toDate(), 24);
        await insertData(date, data);
    }
};

const generateAndInsertDemandRealToday = async () => {
    const santiagoTime = moment().tz('America/Santiago');
    const hour = parseInt(santiagoTime.format('H'));

    const data = generateData(santiagoTime.toDate(), hour === 0 ? 24 : hour);
    await insertDataToday(data);
};

const generateData = (date, limit) => {
    const data = [];

    for (let i = 1; i <= limit; i++) {
        const fecha = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        let demanda = 7600 + (Math.random() * 2300);
        data.push({fecha, hora: i, demanda});
    }

    return data;
};

const insertData = async (fecha, data) => {
    try {
        const result = await RealDemand.count({
            where: {
                fecha: fecha,
            },
            raw: true,
        });

        if (result === 0) {
            const promises = data.map(async (item) => {
                await RealDemand.create({
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

const insertDataToday = async (data) => {
    try {
        let inserts = false;
        const promises = data.map(async (item) => {
            const result = await RealDemand.count({
                where: {
                    fecha: item.fecha,
                    hora: item.hora
                },
                raw: true,
            });

            if (result === 0) {
                inserts = true;
                await RealDemand.create({
                    fecha: item.fecha,
                    hora: item.hora,
                    demanda: item.demanda
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

const realDemandJob = cron.schedule('0 2 * * *', async () => {
    await generateAndInsertDemandaReal();
});

const realDemandJobToday = cron.schedule('0 3 * * * *', async () => {
    await generateAndInsertDemandRealToday();
});

module.exports = {realDemandJob: realDemandJob, realDemandJobToday: realDemandJobToday,
    generateAndInsertDemandaReal, generateAndInsertDemandRealToday};
