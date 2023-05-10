const { ErrorHandler } = require('../helpers/errorHandler');
const { Plan, Organisation } = require('../models');
const { buildCriteria } = require('../services/utilityService');
const APIRequest = require('../helpers/APIRequest');
const { paystack_config } = require('../config/config');
const { PAYSTACK_API_URL } = require('../config/constants');

const create = async (planData, OrganisationId) => {
    const intervals = ['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'annually', 'single payment'];
    if (!intervals.includes(planData.interval.toLowerCase())) {
        throw new ErrorHandler(400, 'Invalid plan interval');
    }

    const paystackPlan = { ...planData, amount: parseFloat(planData.amount) * 100, interval: planData.interval.toLowerCase() };
    if (planData.interval == 'Single Payment') {
        paystackPlan.invoice_limit = 1;
        paystackPlan.interval = 'annually';
    }
    // create plan on Paystack
    const option = {
        headers: { Authorization: `Bearer ${paystack_config.SECRET_KEY}` },
        baseURL: PAYSTACK_API_URL
    };
    const apiRequest = new APIRequest(option);
    const url = '/plan';
    const { status: responseStatus, data } = await apiRequest.post(url, paystackPlan);

    if (!responseStatus) throw new ErrorHandler(400, 'unable to create plan');

    planData.plan_code = data.plan_code;
    const plan = await Plan.create({ ...planData, OrganisationId });
    return sanitize(plan);
}


const view = async (queryCriteria) => {
    const { criteria, options } = buildCriteria(queryCriteria);
    return Plan.findOne({ where: criteria, ...options });
}

const findOne = async id => {
    const plan = await view({
        where: { id },
        include: {
            model: Organisation,
            attributes: ['id', 'name', 'description', 'logo', 'phone', 'category', 'organisation_type', 'website', 'user_id', 'createdAt', 'updatedAt'],
        },
        raw: true,
        nest: true
    });
    if (!plan) throw new ErrorHandler(404, 'Plan not found');

    return sanitize(plan);
}


const list = async (queryCriteria = {}) => {
    const { criteria, options } = buildCriteria(queryCriteria);
    const plans = await Plan.findAll({
        where: criteria,
        include: [
            {
                model: Organisation,
                attributes: ['id', 'name', 'description', 'logo', 'phone', 'category', 'organisation_type', 'website', 'user_id', 'createdAt', 'updatedAt'],
                required: false
            },
        ],
        order: [
            ['createdAt', 'DESC']
        ],
        raw: true,
        nest: true,
        ...options
    });

    return plans;
}

const findAll = async criteria => {
    const plans = await list(criteria);
    return plans.map(plan => sanitize(plan));
}


const update = async (plan, id, OrganisationId) => {
    await Plan.update(plan, { where: { id, OrganisationId } });
}

const _delete = async (id, OrganisationId) => {
    return Plan.update({ deleted: true }, { where: { id, OrganisationId } });
}

const sanitize = plan => {
    // const plan = rawPlan.toJSON();
    plan.organisation = plan.Organisation;
    delete plan.deleted;
    delete plan.Organisation;
    delete plan.OrganisationId
    return plan;
}


module.exports = {
    create,
    findOne,
    findAll,
    update,
    _delete
}