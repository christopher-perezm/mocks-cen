const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize.config');

class GenerationForecast extends Model {}

GenerationForecast.init(
    {
        fecha: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        hora: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        tecnologia: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        generacion: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'forecast_generation',
    }
);

module.exports = { GenerationForecast };
