'use strict';

module.exports = (sequelize, DataTypes) => {
    const CampaignPix = sequelize.define('CampaignPix', {
        location: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'campaignPix',
        indexes: [{
            unique: true,
            fields: ['location']
        }]
    });

    CampaignPix.associate = function (models) {
        CampaignPix.belongsTo(models.Campaign);
    }

    return CampaignPix;
}