'use strict';

module.exports = (sequelize, DataTypes) => {
    const Country = sequelize.define('Country', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        code: DataTypes.STRING
    }, {
        tableName: 'countries',
        timestamps: false
    });

    return Country;
}