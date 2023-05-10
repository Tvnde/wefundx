'use strict';

module.exports = (sequelize, DataTypes) => {
    const Campaign = sequelize.define('Campaign', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: DataTypes.TEXT,
        campaign_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        processing_fee_by: DataTypes.TEXT,
        commission_fee: {
            type: DataTypes.INTEGER
        },
        campaign_target: DataTypes.STRING,
        start_date: DataTypes.DATE,
        end_date: DataTypes.DATE,
        status: {
            type: DataTypes.STRING,
            defaultValue: 'active'
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'campaigns'
    });

    Campaign.associate = function (models) {
        Campaign.belongsTo(models.Plan);
        Campaign.belongsTo(models.Organisation);
        Campaign.hasMany(models.CampaignPix, { as: 'image' });
    }

    return Campaign;
}