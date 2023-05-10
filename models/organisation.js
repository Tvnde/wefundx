'use strict';

module.exports = (sequelize, DataTypes) => {
    const Organisation = sequelize.define('Organisation', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        category: DataTypes.STRING,
        organisation_type: DataTypes.STRING,
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING
        },
        user_id: DataTypes.INTEGER,
        website: DataTypes.STRING,
        logo: DataTypes.STRING,
        address: DataTypes.TEXT,
        country: DataTypes.STRING,
        state: DataTypes.STRING,
        city: DataTypes.STRING,
        landmark: DataTypes.STRING,
        local_gov: DataTypes.STRING,
        business_phone: DataTypes.STRING,
        instagram: DataTypes.STRING,
        facebook: DataTypes.STRING,
        support_email: DataTypes.STRING,
        dispute_email: DataTypes.STRING,
        accept_donations_via: {
            type: DataTypes.STRING,
        },
        platform_fee_by: {
            type: DataTypes.STRING,
        },
        send_transaction_receipt_to: {
            type: DataTypes.STRING,
        },
        test_secret_key: {
            type: DataTypes.STRING
        },
        test_public_key: {
            type: DataTypes.STRING
        },
        live_secret_key: {
            type: DataTypes.STRING
        },
        live_public_key: {
            type: DataTypes.STRING
        },
        callback_url: DataTypes.STRING,
        webhook_url: DataTypes.STRING,
        status: {
            type: DataTypes.STRING,
            defaultValue: 'pending'
        },
        rc_number: {
            type: DataTypes.STRING,
        },
        tin: {
            type: DataTypes.STRING,
        },
        certificate_of_incorporation: DataTypes.STRING,
        memorandum_and_articles_of_association: DataTypes.STRING,
        cac_1_1: DataTypes.STRING,
        identification: DataTypes.STRING,
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'organisations',
        indexes: [
            {
                unique: true, fields: ['name']
            },
            {
                unique: true, fields: ['test_secret_key']
            },
            {
                unique: true, fields: ['test_public_key']
            },
            {
                unique: true, fields: ['live_secret_key']
            },
            {
                unique: true, fields: ['live_public_key']
            },
            {
                unique: true, fields: ['rc_number']
            },
            {
                unique: true, fields: ['tin']
            }
        ]
    });

    Organisation.associate = function (models) {
        Organisation.hasMany(models.Campaign, { as: 'campaigns' });
        Organisation.hasMany(models.Plan, { as: 'plans' });
        Organisation.hasMany(models.Dispute, { as: 'disputes' });
        Organisation.hasMany(models.AuditLog, { as: 'audit_logs' });
    }

    return Organisation;
}