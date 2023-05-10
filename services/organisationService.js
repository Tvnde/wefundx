const { Organisation, UserOrganisation, Campaign, User, Director, sequelize } = require('../models');
const { buildCriteria, generateId } = require('./utilityService');
const userService = require('./userService');
const { uploadFile } = require('../helpers/fileUpload');
const { Op } = require('sequelize');
const emailService = require('./emailService');
const campaignService = require('./campaignService');
const donationService = require('./donationService');
const planService = require('../services/planService');
const payoutService = require('./payoutService');
const { TEAM_MEMBER_FIELDS } = require('../config/constants');
const { ErrorHandler } = require('../helpers/errorHandler');
const path = require('path');
const fs = require("fs");

const fields = {
    basic: ['id', 'name', 'description', 'logo', 'phone', 'category', 'organisation_type', 'website', 'address', 'user_id', 'status', 'createdAt', 'updatedAt'],
    settings: ['accept_donations_via', 'platform_fee_by', 'send_transaction_receipt_to', 'test_secret_key', 'test_public_key', 'live_public_key',
        'callback_url', 'webhook_url'],
    documents: ['name', 'rc_number', 'tin', 'certificate_of_incorporation', 'memorandum_and_articles_of_association', 'cac_1_1', 'identification'],
    contact: ['dispute_email', 'support_email', 'facebook', 'instagram', 'business_phone']
};

const create = async (organisation) => {
    let org;
    const { user_id } = organisation;

    organisation.test_public_key = generateId('WF_TEST');
    organisation.test_secret_key = generateId('WF_TEST');
    organisation.live_public_key = generateId('WF_LIVE');

    org = await Organisation.create({ ...organisation });
    await Promise.all([
        UserOrganisation.create({ user_id, organisation_id: org.id }),
        User.update({ active_organisation: org.id }, { where: { id: user_id } })
    ]);
    return view({ where: { id: org.id } });
}

const uploadLogo = async (organisationId, logo) => {
    const organisation = await view({ where: { id: organisationId } });
    if (!organisation) throw new ErrorHandler(400, 'Organisation not found');

    const fileLocation = uploadFile(logo.logo, 'logos');
    await Organisation.update({ logo: fileLocation }, { where: { id: organisationId } });
    return fileLocation;
}


const findOne = async (id, scope = 'basic') => {
    const organisation = await view({ where: { id } }, scope);
    if (!organisation) throw new ErrorHandler(404, 'Organisation not found');
    return sanitize(organisation);
}


const view = async (queryCriteria, scope = 'basic') => {
    const { criteria, options } = buildCriteria(queryCriteria);
    const _fields = scope == 'all' ? [...fields.basic, ...fields.settings, ...fields.documents, ...fields.contact] : fields[scope];
    return Organisation.findOne({ where: criteria, attributes: _fields, ...options });
}


const list = async (queryCriteria = {}, scope = 'basic') => {
    const { criteria, options } = buildCriteria(queryCriteria);
    const organisations = await Organisation.findAll({
        where: criteria,
        attributes: fields[scope],
        order: [
            ['createdAt', 'DESC']
        ],
        ...options
    });

    return organisations.map(org => sanitize(org, scope));
}


const update = async ({ body, files = {} }, id) => {
    const documents = prepareUploadDocuments(files);
    await Organisation.update({ ...body, ...documents }, { where: { id } });
}


const prepareUploadDocuments = files => {
    const documents = Object.keys(files).reduce((docs, file) => {
        docs[file] = uploadFile(files[file], 'documents');
        return docs;
    }, {});
    return documents;
}


const getDirectors = async id => {
    return Director.findAll({ where: { organisation_id: id } });
}


const addDirector = async ({ files: file, body: directorData }) => {
    const identification_file = file.identification_file ? uploadFile(file.identification_file) : '';
    return Director.create({ ...directorData, identification_file });
}


const addTeam = async ({ fullname, email, role, organisation_id }) => {
    let teamMember = null;
    teamMember = await userService.view({ where: { email } });
    if (!teamMember) {
        teamMember = await User.create({ fullname, email, role });
    }
    const [organisation] = await Promise.all([
        view({ where: { id: organisation_id } }),
        UserOrganisation.create({ user_id: teamMember.id, organisation_id })
    ]);
    emailService.inviteTeamMember(teamMember, organisation.name);
}

const getTeamMember = async (id, organisationId) => {
    const [teamMember, userOrg] = await Promise.all([
        userService.view({ where: { id }, attributes: TEAM_MEMBER_FIELDS }),
        UserOrganisation.findOne({ where: { user_id: id, organisation_id: organisationId, deleted: false } })
    ]);

    if (teamMember && !userOrg) {
        throw new ErrorHandler(400, 'This user is deleted, or doesn\'t belong to this organisation');
    }
    return teamMember;
}

const getTeams = async id => {
    const users = await UserOrganisation.findAll({ where: { organisation_id: id, deleted: false }, attributes: ['user_id'], raw: true });
    return userService.list({
        where: { id: { [Op.in]: users.map(user => user.user_id) } },
        attributes: TEAM_MEMBER_FIELDS
    });
}

const deleteTeamMember = async (id, organisation_id) => {
    return UserOrganisation.update({ deleted: true }, { where: { id, organisation_id } });
}

const getCampaigns = async OrganisationId => {
    return campaignService.findAll({ where: { OrganisationId } });
}

const getPlans = async OrganisationId => {
    return planService.findAll({ where: { OrganisationId } });
}

const getDonations = async OrganisationId => {
    return donationService.findAll({
        where: { OrganisationId },
        include: {
            model: Campaign,
            as: 'campaign',
            attributes: ['id', 'title', 'campaign_type', 'start_date', 'end_Date']
        }
    });
}


const _delete = async (id) => {
    return Organisation.update({ deleted: true }, { where: { id } });
}


const getDashboardStat = async organisationId => {

    const [[donation_chart_data], [campaign_chart_data], [donor_chart_data], [payout_chart_data], total_campaigns, total_donations, total_donors, total_payouts, [today_donations], [today_campaigns], [today_donors], [today_payouts]] = await Promise.all([
        sequelize.query('SELECT SUM(amount) total_amount, DATE_FORMAT(createdAt, \'%b\') month FROM `donations` WHERE OrganisationId = ? AND YEAR(createdAt) = YEAR(CURDATE()) GROUP BY DATE_FORMAT(createdAt, \'%b\')', { replacements: [organisationId] }),
        sequelize.query('SELECT COUNT(*) total, DATE_FORMAT(createdAt, \'%b\') month FROM `campaigns` WHERE OrganisationId = ? AND YEAR(createdAt) = YEAR(CURDATE()) GROUP BY DATE_FORMAT(createdAt, \'%b\')', { replacements: [organisationId] }),
        sequelize.query('SELECT COUNT(*) total, DATE_FORMAT(createdAt, \'%b\') month FROM `donations` WHERE OrganisationId = ? AND YEAR(createdAt) = YEAR(CURDATE()) GROUP BY DATE_FORMAT(createdAt, \'%b\')', { replacements: [organisationId] }),
        sequelize.query('SELECT SUM(amount) total_amount, DATE_FORMAT(createdAt, \'%b\') month FROM `payouts` WHERE organisation_id = ? AND YEAR(createdAt) = YEAR(CURDATE()) GROUP BY DATE_FORMAT(createdAt, \'%b\')', { replacements: [organisationId] }),
        campaignService.getTotalCampaigns(organisationId),
        donationService.getTotalDonations(organisationId),
        donationService.getTotalDonors(organisationId),
        payoutService.getTotalPayouts(organisationId),
        sequelize.query(`SELECT * FROM donations WHERE OrganisationId = ? AND DATE(createdAt) = CURDATE() AND status = 'success'`, { replacements: [organisationId] }),
        sequelize.query(`SELECT * FROM campaigns WHERE OrganisationId = ? AND DATE(createdAt) = CURDATE()`, { replacements: [organisationId] }),
        sequelize.query(`SELECT donor_email FROM donations  WHERE OrganisationId = ? AND DATE(createdAt) = CURDATE() AND status = 'success' GROUP BY donor_email`, { replacements: [organisationId] }),
        sequelize.query(`SELECT COUNT(*) total FROM payouts WHERE organisation_id = ? AND DATE(createdAt) = CURDATE() AND status = 'success'`, { replacements: [organisationId] }),
    ]);

    return {
        donations: {
            today: today_donations.length,
            monthly: donation_chart_data,
            total: total_donations
        },
        campaign: {
            today: today_campaigns.length,
            monthly: campaign_chart_data,
            total: total_campaigns
        },
        donors: {
            today: today_donors.length,
            monthly: donor_chart_data,
            total: total_donors
        },
        payout: {
            today: today_payouts[0].total,
            monthly: payout_chart_data,
            total: total_payouts
        }
    }
}

const fetchDocuments = async (organisationId) => {
    const files = await view({ where: { id: organisationId }, raw: true }, 'documents');
    const docs = [];
    Object.keys(files).forEach(key => {
        const _path = path.join(__dirname, '../', `uploads/documents/${path.basename(files[key])}`);
        if (fs.existsSync(_path)) {
            docs.push({ path: _path, name: path.basename(files[key]) });
        }
    });
    return docs;
}


const sanitize = (organisation, scope = 'basic') => {
    delete organisation.deleted;
    return organisation;
}

module.exports = {
    create,
    uploadLogo,
    findOne,
    view,
    list,
    update,
    getDirectors,
    addDirector,
    getTeams,
    addTeam,
    getTeamMember,
    getCampaigns,
    getPlans,
    getDonations,
    _delete,
    deleteTeamMember,
    getDashboardStat,
    fetchDocuments
}