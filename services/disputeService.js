const { ErrorHandler } = require('../helpers/errorHandler');
const { Dispute, User } = require('../models');
const { buildCriteria } = require('../services/utilityService');

const create = async (disputeData, OrganisationId) => {
    const disputeTypes = ['fraud', 'chargeback'];
    if (!disputeTypes.includes(disputeData.dispute_type.toLowerCase())) {
        throw new ErrorHandler(400, 'Invalid dispute type. Choose from [fraud or chargeback]');
    }
    const dispute = await Dispute.create({ ...disputeData, OrganisationId });
    return sanitize(dispute);
}


const view = async (queryCriteria) => {
    const { criteria, options } = buildCriteria(queryCriteria);
    return Dispute.findOne({ where: criteria, ...options });
}

const findOne = async id => {
    const dispute = await view({
        where: { id },
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'fullname', 'email', 'role']
            }
        ]
    });
    if (!dispute) throw new ErrorHandler(404, 'Dispute not found');

    return sanitize(dispute);
}


const list = async (queryCriteria = {}) => {
    const { criteria, options } = buildCriteria(queryCriteria);
    const disputes = await Dispute.findAll({
        where: criteria,
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'fullname', 'email', 'role']
            }
        ],
        order: [
            ['createdAt', 'DESC']
        ],
        ...options
    });

    return disputes;
}

const findAll = async () => {
    const disputes = await list();
    return disputes.map(dispute => sanitize(dispute));
}


const update = async (dispute, id) => {
    const disputeTypes = ['fraud', 'chargeback'];
    if (dispute.dispute_type && !disputeTypes.includes(dispute.dispute_type.toLowerCase())) {
        throw new ErrorHandler(400, 'Invalid dispute type. Choose from [fraud or chargeback]');
    }
    await Dispute.update(dispute, { where: { id } });
}

const _delete = async (id) => {
    return Dispute.update({ deleted: true }, { where: { id } });
}

const sanitize = rawDispute => {
    const dispute = rawDispute.toJSON();
    delete dispute.deleted;
    return dispute;
}


module.exports = {
    create,
    findOne,
    findAll,
    update,
    _delete
}