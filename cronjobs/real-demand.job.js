const cron = require('node-cron');
const moment = require('moment-timezone');
const {RealDemand} = require('../models/demand-real.model');

const generateAndInsertDemandaReal = async () => {
    const santiagoTime = moment().tz('America/Santiago');
    const yesterday = santiagoTime.clone().subtract(1, 'day');
    const twoDaysAgo = santiagoTime.clone().subtract(2, 'day');
    const dates = [yesterday, twoDaysAgo];

    for (const date of dates) {
        const data = generateData(date, 24);
        await insertData(date, data);
    }
};

const generateAndInsertDemandRealToday = async () => {
    const santiagoTime = moment().tz('America/Santiago');
    const hour = parseInt(santiagoTime.format('H'));

    //const santiagoTime = moment().tz('America/Santiago').subtract(1, 'day');
    //const hour = 24;

    const data = generateData(santiagoTime, hour === 0 ? 24 : hour);
    await insertDataToday(data);
};

const generateData = (date, limit) => {
    const data = [];

    for (let i = 1; i <= limit; i++) {
        let demanda = 7600 + (Math.random() * 2300);
        data.push({fecha: date, hora: i, demanda});
    }

    return data;
};

const insertData = async (fecha, data) => {
    try {
        const result = await RealDemand.count({
            where: {
                fecha: fecha.format('YYYY-MM-DD'),
            },
            raw: true,
        });

        if (result === 0) {
            const promises = data.map(async (item) => {
                await RealDemand.create({
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

const insertDataToday = async (data) => {
    try {
        let inserts = false;
        const promises = data.map(async (item) => {
            const result = await RealDemand.count({
                where: {
                    fecha: item.fecha.format('YYYY-MM-DD'),
                    hora: item.hora
                },
                raw: true,
            });

            if (result === 0) {
                inserts = true;
                await RealDemand.create({
                    fecha: item.fecha.format('YYYY-MM-DD'),
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

const realDemandJob = cron.schedule('0 5 4 * * *', async () => {
    const fecha = moment.tz('America/Santiago');
    console.log("> Inicio Job demanda real ayer y antier, "+ fecha.format("YYYY-mm-DD HH:mm:SS"));
    await generateAndInsertDemandaReal();
    console.log("> Fin Job demanda real ayer y antier");
});

const realDemandJobToday = cron.schedule('0 3 * * * *', async () => {
    const fecha = moment.tz('America/Santiago');
    console.log("> Inicio Job demanda real hora, " + fecha.format("YYYY-mm-DD HH:mm:SS"));
    await generateAndInsertDemandRealToday();
});

module.exports = {realDemandJob: realDemandJob, realDemandJobToday: realDemandJobToday,
    generateAndInsertDemandaReal, generateAndInsertDemandRealToday};
