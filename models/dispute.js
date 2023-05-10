'use strict';

module.exports = (sequelize, DataTypes) => {
    const Dispute = sequelize.define('Dispute', {
        dispute_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: DataTypes.STRING,
        status: {
            type: DataTypes.STRING,
            defaultValue: 'pending'
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'disputes'
    });

    Dispute.associate = function (models) {
        Dispute.belongsTo(models.Organisation);
        Dispute.belongsTo(models.User, { foreignKey: 'assigned_to', as: 'user' });
    }

    return Dispute;
}