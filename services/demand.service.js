const {RealDemand} = require('../models/demand-real.model');
const {ForecastDemand} = require('../models/demand-forecast.model');
const {Op, Sequelize} = require('sequelize');
const moment = require('moment-timezone');

exports.getRealDemands = async (req, res) => {
    try {
        const startDate = moment(req.query.startDate).startOf('day').toDate();
        const endDate = moment(req.query.endDate).endOf('day').toDate();

        const page = parseInt(req.query.page) || 0;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = page * pageSize;
        const {count, rows} = await RealDemand.findAndCountAll({
            attributes: ['fecha', 'hora', 'demanda'],
            where: {
                fecha: {
                    [Op.between]: [startDate, endDate]
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

exports.getRealDemandsMax = async (req, res) => {
    try {
        const startDate = moment(req.query.startDate).startOf('day').toDate();
        const endDate = moment(req.query.endDate).endOf('day').toDate();

        const rows = await RealDemand.findAll({
            attributes: ['fecha', 'hora', 'demanda'],
            where: {
                fecha: {
                    [Op.between]: [startDate, endDate]
                }
            },
            order: [['demanda', 'DESC']],
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


exports.getForecastDemands = async (req, res) => {
    try {
        const startDate = moment(req.query.startDate).startOf('day').toDate();
        const endDate = moment(req.query.endDate).endOf('day').toDate();

        const page = parseInt(req.query.page) || 0;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = page * pageSize;
        const {count, rows} = await ForecastDemand.findAndCountAll({
            attributes: ['fecha', 'hora', 'demanda'],
            where: {
                fecha: {
                    [Op.between]: [startDate, endDate]
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

exports.getResumeDemands = async (req, res) => {
    try {
        const startDate = moment(req.query.startDate).startOf('day');
        const endDate = moment(req.query.endDate).endOf('day');

        const rows = await RealDemand.findAll({
            attributes: [
                'fecha',
                'hora',
                [Sequelize.literal('demanda'), 'real_demand'],
                [Sequelize.literal('(SELECT demanda FROM forecast_demands WHERE fecha = real_demand.fecha AND hora = real_demand.hora)'), 'forecast_demand'],
                [Sequelize.literal('(100 * abs((SELECT demanda FROM forecast_demands WHERE fecha = real_demand.fecha AND hora = real_demand.hora) - demanda) / (SELECT demanda FROM forecast_demands WHERE fecha = real_demand.fecha AND hora = real_demand.hora))'), 'mape'],
            ],
            where: {
                fecha: {
                    [Op.between]: [startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')]
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