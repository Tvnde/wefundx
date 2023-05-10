const { ErrorHandler } = require('../helpers/errorHandler');
const { Payout, sequelize } = require('../models');
const { buildCriteria } = require('../services/utilityService');

const create = async (payoutData) => {
    const newPayout = await Payout.create(payoutData);
    const payout = await view({ id: newPayout.id });
    return sanitize(payout);
}


const view = async (queryCriteria) => {
    const { where, criteria } = buildCriteria(queryCriteria);
    return Payout.findOne({ where, ...criteria });
}

const findOne = async id => {
    const payout = await view({
        where: { id }
    });
    if (!payout) throw new ErrorHandler(404, 'Payout not found');
    return sanitize(payout);
}


const list = async (queryCriteria = {}) => {
    const { where, criteria } = buildCriteria(queryCriteria);
    const payouts = await Payout.findAll({
        where,
        order: [
            ['createdAt', 'DESC']
        ],
        ...criteria
    });

    return payouts;
}

const findAll = async () => {
    const payouts = await list();
    return payouts.map(payout => sanitize(payout));
}


const update = async (payout, id) => {
    const foundPayout = await findOne(id);
    if (foundPayout.status != 'pending') {
        throw new ErrorHandler(400, 'Can only update pending payout request');
    }
    if (payout.status == 'success') {
        payout.payout_date = new Date(Date.now());
    }
    await Payout.update(payout, { where: { id } });
}

const _delete = async (id) => {
    return Payout.update({ deleted: true }, { where: { id } });
}


const getTotalPayouts = async (organisationId = null) => {
    let organisation = {};
    if (organisationId) organisation.organisation_id = organisationId;

    const [payout] = await Payout.findAll({
        where: { status: 'success', ...organisation },
        attributes: [
            [sequelize.fn('sum', sequelize.col('amount')), 'total_payouts']
        ],
        raw: true
    });
    return payout.total_payouts || 0;
}

const sanitize = rawPayout => {
    const payout = rawPayout.toJSON();
    delete payout.deleted;
    return payout;
}


module.exports = {
    create,
    findOne,
    findAll,
    update,
    _delete,
    getTotalPayouts
}