'use strict';

module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define('Notification', {
        description: {
            type: DataTypes.TEXT,
        },
        organisation_id: DataTypes.INTEGER,
        status: {
            type: DataTypes.STRING,
            defaultValue: 'new'
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'notifications'
    });

    return Notification;
}