const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize.config');

class ForecastDemand extends Model {}

ForecastDemand.init(
    {
        fecha: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        hora: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        demanda: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'forecast_demand',
    }
);


module.exports = { ForecastDemand };