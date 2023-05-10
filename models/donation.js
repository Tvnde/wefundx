'use strict';

module.exports = (sequelize, DataTypes) => {
    const Donation = sequelize.define('Donation', {
        donor_name: DataTypes.STRING,
        donor_email: DataTypes.STRING,
        donor_anonymous: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        donation_type: DataTypes.STRING,
        channel: DataTypes.STRING,
        reference: {
            type: DataTypes.STRING
        },
        comment: DataTypes.TEXT,
        status: {
            type: DataTypes.STRING,
            defaultValue: 'pending'
        }
    }, {
        tableName: 'donations',
        indexes: [
            { unique: true, fields: ['reference'] }
        ]
    });

    Donation.associate = function (models) {
        Donation.belongsTo(models.Organisation, { as: 'organisation', foreignKey: 'OrganisationId' });
        Donation.belongsTo(models.Campaign, { as: 'campaign', foreignKey: 'CampaignId' });
    }

    return Donation;
}