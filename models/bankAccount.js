'use strict';

module.exports = (sequelize, DataTypes) => {
    const BankAccount = sequelize.define('BankAccount', {
        account_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        bank_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        account_number: {
            type: DataTypes.STRING,
            allowNull: false
        },
        organisation_id: DataTypes.INTEGER,
        status: {
            type: DataTypes.STRING,
            defaultValue: 'active'
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'bankAccounts',
        indexes: [
            { unique: true, fields: ['account_number'] }
        ]
    });

    return BankAccount;
}