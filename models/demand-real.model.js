const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize.config');

class RealDemand extends Model {}

RealDemand.init(
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
        modelName: 'real_demand',
    }
);


module.exports = { RealDemand };