'use strict';

module.exports = (sequelize, DataTypes) => {
    const AuditLog = sequelize.define('AuditLog', {
        activity: {
            type: DataTypes.STRING,
            allowNull: false
        },
        ip_address: DataTypes.STRING,
        data: DataTypes.TEXT,
        metadata: DataTypes.STRING
    }, {
        tableName: 'auditLogs'
    });

    AuditLog.associate = function (models) {
        AuditLog.belongsTo(models.Organisation);
        AuditLog.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }

    return AuditLog;
}