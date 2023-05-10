'use strict';

module.exports = (sequelize, DataTypes) => {
    const Bank = sequelize.define('Bank', {
        bank: {
            type: DataTypes.STRING,
            allowNull: false
        },
        country_id: {
            type: DataTypes.INTEGER
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'banks',
        indexes: [
            { unique: true, fields: ['code'] }
        ]
    });

    return Bank;
}