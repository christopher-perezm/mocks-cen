const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize.config');

class GenerationReal extends Model {}

GenerationReal.init(
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
        modelName: 'real_generation',
    }
);

module.exports = { GenerationReal };
