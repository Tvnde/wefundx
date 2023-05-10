'use strict';

module.exports = (sequelize, DataTypes) => {
    const Plan = sequelize.define('Plan', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        interval: DataTypes.STRING,
        plan_code: DataTypes.STRING,
        status: {
            type: DataTypes.STRING,
            defaultValue: 'active'
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'plans',
        indexes: [
            { unique: true, fields: ['plan_code'] },
        ]
    });

    Plan.associate = function (models) {
        Plan.hasMany(models.Campaign);
        Plan.belongsTo(models.Organisation);
    }

    return Plan;
}