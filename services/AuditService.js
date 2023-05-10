const { ErrorHandler } = require('../helpers/errorHandler');
const { AuditLog, User } = require('../models');
const { buildCriteria } = require('./utilityService');

const create = async (req, message, model = '') => {
    const organisation = req.user.organisation || null;
    if (!organisation) return; // invalid log attempt
    const org_name = organisation && 'for ' + organisation.name || '';
    const auditData = {
        OrganisationId: organisation.id,
        ip_address: req.ip,
        activity: `${req.user.fullname} ${message}`,
        metadata: JSON.stringify({ user: req.user.id, model }),
        user_id: req.user.id
    };
    if (req.body || req.params) {
        let data = req.body || {};
        if (req.params) {
            data = { ...data, ...req.params };
        }
        auditData.data = JSON.stringify(data);
    }
    await AuditLog.create(auditData);
}


const view = async (queryCriteria) => {
    const { criteria, options } = buildCriteria(queryCriteria, false);
    return AuditLog.findOne({ where: criteria, ...options });
}

const findOne = async id => {
    const auditLog = await view({
        where: { id },
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'fullname', 'email', 'role']
            }
        ]
    });
    if (!auditLog) throw new ErrorHandler(404, 'Log not found');
    return sanitize(auditLog);
}


const list = async (queryCriteria = {}) => {
    const { criteria, options } = buildCriteria(queryCriteria, false);
    const campaigns = await AuditLog.findAll({
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

    return campaigns;
}

const findAll = async criteria => {
    const campaigns = await list(criteria);
    return campaigns.map(auditLog => sanitize(auditLog));
}

const sanitize = rawAuditLog => {
    const auditLog = rawAuditLog.toJSON();
    return auditLog;
}


module.exports = {
    create,
    findOne,
    findAll
}