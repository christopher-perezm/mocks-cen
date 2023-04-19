const {GenerationForecast} = require('../models/generation-forecast.model');
const {Op} = require('sequelize');
const moment = require('moment-timezone');
const {GenerationReal} = require('../models/generation-real.model');

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