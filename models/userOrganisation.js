'use strict';

module.exports = (sequelize, DataTypes) => {
    const UserOrganisation = sequelize.define('UserOrganisation', {
        user_id: DataTypes.INTEGER,
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
        tableName: 'userOrganisations',
        indexes: [
            {
                unique: false,
                fields: ['organisation_id']
            },
            {
                unique: false,
                fields: ['user_id']
            }
        ]
    });

    return UserOrganisation;
}