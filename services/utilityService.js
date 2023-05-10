const chance = require('chance').Chance();

module.exports = {
    buildCriteria: (options, deleteFlag = true) => {
        const { where: criteria = {} } = options;
        delete options.where;
        if (deleteFlag) criteria.deleted = false;
        return { criteria, options };
    },

    generateId: (prefix = '', length = 35, num = false) => {
        const pool = num ? '0123456789' : 'abcdefghijklmnopqrstuvwxyz1234567890';
        return `${prefix}_${chance.string({ length, pool })}`;
    },

    formatCurrency: input => {
        return parseInt(input).toLocaleString('en-US', { style: 'decimal' });
    }
}