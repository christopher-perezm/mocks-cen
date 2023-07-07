const {GenerationForecast} = require('../models/generation-forecast.model');
const {Op, Sequelize} = require('sequelize');
const moment = require('moment-timezone');
const {GenerationReal} = require('../models/generation-real.model');

const {
    generateAndInsertGxErvDate
} = require('../cronjobs/forecast-generation.job');
const {
    generateAndInsertGxRealDate
} = require('../cronjobs/real-generation.job');
const {generateAndInsertDemandForecastDate} = require("../cronjobs/forecast-demand.job");


exports.getGenerationsForecasts = async (req, res) => {
    try {
        const startDate = moment(req.query.startDate).startOf('day').toDate();
        const endDate = moment(req.query.endDate).endOf('day').toDate();
        const technology = req.query.technology;

        const page = parseInt(req.query.page) || 0;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = page * pageSize;
        const {count, rows} = await GenerationForecast.findAndCountAll({
            attributes: ['fecha', 'hora', 'generacion'],
            where: {
                fecha: {
                    [Op.between]: [startDate, endDate]
                },
                tecnologia: {
                    [Op.eq]: technology
                }
            },
            order: [['fecha', 'DESC'], ['hora', 'DESC']],
            offset,
            limit: pageSize
        });

        const totalPages = Math.ceil(count / pageSize);
        const response = {
            page,
            pageSize,
            totalElements: count,
            totalPages,
            content: rows
        };
        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error getting generations by date range'});
    }
};

exports.getGenerationsReal = async (req, res) => {
    try {
        const startDate = moment(req.query.startDate).startOf('day').toDate();
        const endDate = moment(req.query.endDate).endOf('day').toDate();
        const technology = req.query.technology;

        const page = parseInt(req.query.page) || 0;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = page * pageSize;
        const {count, rows} = await GenerationReal.findAndCountAll({
            attributes: ['fecha', 'hora', 'generacion'],
            where: {
                fecha: {
                    [Op.between]: [startDate, endDate]
                },
                tecnologia: {
                    [Op.eq]: technology
                }
            },
            order: [['fecha', 'DESC'], ['hora', 'DESC']],
            offset,
            limit: pageSize
        });

        const totalPages = Math.ceil(count / pageSize);
        const response = {
            page,
            pageSize,
            totalElements: count,
            totalPages,
            content: rows
        };
        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error getting generations by date range'});
    }
};

exports.getGenerationsRealMax = async (req, res) => {
    try {
        const startDate = moment(req.query.startDate).startOf('day').toDate();
        const endDate = moment(req.query.endDate).endOf('day').toDate();
        const technology = req.query.technology;

        const rows = await GenerationReal.findAll({
            attributes: ['fecha', 'hora', 'generacion', 'tecnologia'],
            where: {
                fecha: {
                    [Op.between]: [startDate, endDate]
                },
                tecnologia: {
                    [Op.eq]: technology
                }
            },
            order: [['generacion', 'DESC']],
            limit: 1
        });

        const response = {
            page: 0,
            pageSize: 10,
            totalElements: 1,
            totalPages: 1,
            content: rows
        };
        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error getting generations by date range'});
    }
};

exports.deleteGenerationsForecast = (req, res) => {
    const fecha = new Date(req.params.fecha);
    GenerationForecast.destroy({
        where: {
            fecha: fecha
        }
    })
        .then(() => {
            res.status(204).send();
        })
        .catch((err) => {
            console.error('Error al eliminar la generación programada:', err);
            res.status(500).send({message: 'Error al eliminar la generación programada'});
        });
};

exports.deleteGenerationsReal = (req, res) => {
    const fecha = new Date(req.params.fecha);
    GenerationReal.destroy({
        where: {
            fecha: fecha
        }
    })
        .then(() => {
            res.status(204).send();
        })
        .catch((err) => {
            console.error('Error al eliminar la generación real:', err);
            res.status(500).send({message: 'Error al eliminar la generación real'});
        });
};

exports.getResumeGeneration = async (req, res) => {
    try {
        const startDate = moment(req.query.startDate).startOf('day');
        const endDate = moment(req.query.endDate).endOf('day');
        const technology = req.query.technology;

        const rows = await GenerationReal.findAll({
            attributes: [
                'fecha',
                'hora',
                [Sequelize.literal('generacion'), 'real_generacion'],
                [Sequelize.literal('(SELECT generacion FROM forecast_generations WHERE fecha = real_generation.fecha AND hora = real_generation.hora AND tecnologia = real_generation.tecnologia)'), 'forecast_generation'],
                [Sequelize.literal('(100 * abs((SELECT generacion FROM forecast_generations WHERE fecha = real_generation.fecha AND hora = real_generation.hora  AND tecnologia = real_generation.tecnologia) - generacion) / (SELECT generacion FROM forecast_generations WHERE fecha = real_generation.fecha AND hora = real_generation.hora  AND tecnologia = real_generation.tecnologia))'), 'mape'],
            ],
            where: {
                fecha: {
                    [Op.between]: [startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')]
                },
                tecnologia: {
                    [Op.eq]: technology
                }
            },
            order: [
                ['fecha', 'ASC'],
                ['hora', 'ASC'],
            ],
        });

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error getting generations by date range'});
    }
};

exports.saveGenerationsReal = async (req, res) => {
    const santiagoTime = moment().tz('America/Santiago');
    const hour = parseInt(santiagoTime.format('H'));
    const now = santiagoTime.startOf('day');

    let startDate = moment(req.query.date).startOf('day');
    let endDate = moment(req.query.endDate ? req.query.endDate : req.query.date).startOf('day');

    startDate = moment.min(startDate, now);
    endDate = moment.min(endDate, now);

    if (startDate.isSameOrBefore(endDate)) {
        const currentDate = startDate.clone();

        while (currentDate.isSameOrBefore(endDate)) {
            if(currentDate.isSame(now)) {
                await generateAndInsertGxRealDate(currentDate, hour);
            } else {
                await generateAndInsertGxRealDate(currentDate);
            }
            currentDate.add(1, 'day');
        }

        res.json("Generates sucessfully");
    } else {
        res.json('La fecha de inicio no es menor que la fecha de fin.');
    }
};

exports.saveGenerationsForecast = async (req, res) => {
    const startDate = moment(req.query.date).startOf('day');
    const endDate = moment(req.query.endDate ? req.query.endDate : req.query.date).startOf('day');

    if (startDate.isSameOrBefore(endDate)) {
        const currentDate = startDate.clone();

        while (currentDate.isSameOrBefore(endDate)) {
            await generateAndInsertGxErvDate(currentDate);
            currentDate.add(1, 'day');
        }

        res.json("Generates sucessfully");
    } else {
        res.json('La fecha de inicio no es menor que la fecha de fin.');
    }
};