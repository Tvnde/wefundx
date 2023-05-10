'use strict';

module.exports = (sequelize, DataTypes) => {
    const Director = sequelize.define('Director', {
        fullname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone: DataTypes.STRING,
        address: DataTypes.TEXT,
        means_of_identification: DataTypes.STRING,
        identification_file: DataTypes.STRING,
        organisation_id: DataTypes.INTEGER,
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'directors'
    });

    return Director;
}