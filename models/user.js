'use strict';

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        fullname: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.STRING
        },
        password: DataTypes.STRING,
        active_organisation: DataTypes.STRING,
        status: {
            type: DataTypes.STRING,
            defaultValue: 'inactive'
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'users',
        indexes: [
            { unique: true, fields: ['email'] },
        ]
    });

    return User;
}