const { ErrorHandler } = require('../helpers/errorHandler');
const { Donation, Campaign, Organisation, Notification, sequelize } = require('../models');
const { buildCriteria, generateId } = require('../services/utilityService');
const APIRequest = require('../helpers/APIRequest');
const { paystack_config } = require('../config/config');
const { PAYSTACK_API_URL } = require('../config/constants');

const create = async (donationData) => {
    const campaign = await Campaign.findByPk(donationData.campaign_id);
    if (!campaign) throw new ErrorHandler(400, 'Campaign not found');

    donationData.CampaignId = campaign.id;
    donationData.OrganisationId = campaign.OrganisationId;
    delete donationData.campaign_id;
    delete donationData.status;
    donationData.reference = generateId('REF');
    const donation = await Donation.create(donationData);
    return view({ where: donation.id });
}


const completeDonation = async (reference) => {
    // first verify payment status
    const { amount, channel, currency, status } = await verifyPayment(reference);

    // verify donation reference
    const donation = await view({ where: { reference }, raw: true });
    if (!donation) {
        throw new ErrorHandler(400, 'Invalid donation reference');
    }

    // verify amount paid
    if (Number(donation.amount) > Number(amount)) {
        // log this
        throw new ErrorHandler(400, 'Amount paid is less than donation amount');
    }

    const [campaign] = await Promise.all([
        Campaign.findByPk(donation.CampaignId),
        Donation.update({ channel, status }, { where: { reference } })
    ]);
    const description = `New donation on your <strong>${campaign.title}</strong> campaign`;
    Notification.create({ organisation_id: donation.OrganisationId, description });
    return { ...donation, channel, status };
}


const verifyPayment = async (reference) => {
    const option = {
        headers: { Authorization: `Bearer ${paystack_config.SECRET_KEY}` },
        baseURL: PAYSTACK_API_URL
    };
    const apiRequest = new APIRequest(option);
    const url = `/transaction/verify/${reference}`;
    const { status: responseStatus, data } = await apiRequest.get(url);

    if (!responseStatus) throw new ErrorHandler(400, 'unable to verify transaction status');

    const { amount, channel, currency, status } = data;
    if (status != 'success') throw new ErrorHandler(400, 'Payment attempt didn\'t succeed');
    return { amount, channel, currency, status };
}


const view = async (queryCriteria) => {
    const { criteria, options } = buildCriteria(queryCriteria, false);
    return Donation.findOne({ where: criteria, ...options });
}

const findOne = async id => {
    const donation = await view({
        where: { id },
        include: [
            {
                model: Organisation,
                as: 'organisation',
                attributes: ['id', 'name', 'description', 'logo', 'phone', 'category', 'organisation_type', 'website', 'address', 'user_id', 'createdAt', 'updatedAt']
            }
        ]
    });
    if (!donation) throw new ErrorHandler(404, 'Donation not found');
    return sanitize(donation);
}


const list = async (queryCriteria = {}) => {
    const { criteria, options } = buildCriteria(queryCriteria, false);
    const donations = await Donation.findAll({
        where: criteria,
        order: [
            ['createdAt', 'DESC']
        ],
        ...options
    });

    return donations;
}

const findAll = async (criteria) => {
    const donations = await list(criteria);
    return donations.map(donation => sanitize(donation));
}

const getTotalDonations = async (organisationId = null) => {
    let organisation = {};
    if (organisationId) organisation.OrganisationId = organisationId;

    const [donation] = await Donation.findAll({
        where: { status: 'success', ...organisation },
        attributes: [
            [sequelize.fn('sum', sequelize.col('amount')), 'total_donations']
        ],
        raw: true
    });
    return donation.total_donations || 0;
}


const getTotalDonors = async (organisationId = null) => {
    let organisation = {};
    if (organisationId) organisation.OrganisationId = organisationId;

    const donation = await Donation.findAll({
        where: { status: 'success', ...organisation },
        attributes: [
            'donor_email'
        ],
        group: ['donor_email'],
        raw: true
    });
    return donation.length;
}

const sanitize = rawDonation => {
    const donation = rawDonation.toJSON ? rawDonation.toJSON() : rawDonation;
    return { ...donation, amount: donation.amount / 100 };
}


module.exports = {
    create,
    findOne,
    findAll,
    completeDonation,
    getTotalDonations,
    getTotalDonors
}