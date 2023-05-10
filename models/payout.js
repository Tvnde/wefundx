'use strict';

module.exports = (sequelize, DataTypes) => {
    const Payout = sequelize.define('Payout', {
        amount: DataTypes.INTEGER,
        settlement_fee: DataTypes.INTEGER,
        organisation_id: DataTypes.INTEGER,
        status: {
            type: DataTypes.STRING,
            defaultValue: 'pending'
        },
        payout_date: DataTypes.DATE,
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'payouts'
    });

    return Payout;
}