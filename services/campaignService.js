const { ErrorHandler } = require('../helpers/errorHandler');
const { Campaign, Plan, Donation, CampaignPix, Organisation, sequelize } = require('../models');
const { buildCriteria } = require('../services/utilityService');
const { uploadFile } = require('../helpers/fileUpload');
const fs = require('fs');
const path = require('path');

const create = async (campaignData) => {
    if (campaignData.plan_id) {
        const plan = await Plan.findByPk(campaignData.plan_id);
        if (!plan) throw new ErrorHandler(400, 'Invalid plan ID');
    }

    campaignData.PlanId = campaignData.plan_id;
    delete campaignData.plan_id;
    const newCampaign = await Campaign.create({ ...campaignData });
    const campaign = await findOne(newCampaign.id);
    return sanitize(campaign);
}

const uploadPhotos = async (campaignId, organisationId, photos) => {
    const campaign = await view({ where: { id: campaignId, OrganisationId: organisationId } });
    if (!campaign) throw new ErrorHandler(404, 'Campaign not found');

    const fileLocations = [];
    const _photos = Array.isArray(photos.photo) ? photos.photo : [photos.photo];

    for (const photo of _photos) {
        const location = uploadFile(photo, 'campaign_photos');
        fileLocations.push(location);
    }

    await CampaignPix.bulkCreate(fileLocations.map(fileLocation => ({ location: fileLocation, CampaignId: campaignId })));
    return fileLocations;
}


const view = async (queryCriteria) => {
    const { criteria, options } = buildCriteria(queryCriteria);
    return Campaign.findOne({ where: criteria, ...options });
}

const findOne = async id => {
    const [campaign, donations, campaignPhotos] = await Promise.all([
        view({
            where: { id },
            include: [
                {
                    model: Organisation,
                    attributes: ['id', 'name', 'description', 'logo', 'phone', 'category', 'organisation_type', 'website', 'user_id', 'createdAt', 'updatedAt'],
                    required: false
                },
                // {
                //     model: Plan,
                //     attributes: ['name', 'amount', 'interval', 'createdAt'],
                //     required: false
                // }
            ],
            raw: true,
            nest: true
        }),
        getCampaignDonationDetails(id),
        CampaignPix.findAll({ where: { CampaignId: id } })
    ]);
    if (!campaign) throw new ErrorHandler(404, 'Campaign not found');

    campaign.images = campaignPhotos.map(photo => ({ id: photo.id, url: photo.location }));
    campaign.donations = donations;

    let total_donated = 0
    let donationDetails = donations.reduce((dons, donation) => {
        if (!dons) dons = {};
        dons[donation.donor_email] = donation.donor_email || '';
        dons[donation.donor_email] = donation;
        total_donated += donation.amount;
        return dons;
    }, Object.create(null));

    donationDetails ||= {};
    campaign.donor_count = Object.keys(donationDetails).length;
    campaign.total_donated = total_donated;

    return sanitize(campaign);
}


const list = async (queryCriteria = {}) => {
    const { criteria, options } = buildCriteria(queryCriteria);

    const campaigns = await Campaign.findAll({
        where: criteria,
        include: {
            model: Organisation,
            attributes: ['id', 'name', 'description', 'logo', 'phone', 'category', 'organisation_type', 'website', 'user_id', 'createdAt', 'updatedAt']
        },
        order: [
            ['createdAt', 'DESC']
        ],
        ...options,
        raw: true,
        nest: true
    });

    return Promise.all(campaigns.map(async campaign => {
        const [donations, campaignImage] = await Promise.all([
            Donation.findAll({
                where: { CampaignId: campaign.id, status: 'success' },
                attributes: [
                    'donor_email',
                    [sequelize.fn('sum', sequelize.col('amount')), 'total_donated']
                ],
                group: ['donor_email'],
                raw: true
            }),
            CampaignPix.findOne({ where: { CampaignId: campaign.id }, attributes: ['location'] })
        ]);

        if (campaignImage) {
            campaign.image = campaignImage.location;
        } else {
            campaign.image = "";
        }

        return {
            ...campaign,
            donor_count: donations.length,
            total_donated: (donations.reduce((total, don) => total + Number(don.total_donated), 0)) / 100
        };
    }));
}

const findAll = async (criteria) => {
    const campaigns = await list(criteria);
    return campaigns.map(campaign => sanitize(campaign));
}


const update = async (campaign, id, OrganisationId) => {
    if (campaign.plan_id) {
        const plan = await Plan.findByPk(campaignData.plan_id);
        if (!plan) throw new ErrorHandler(400, 'Invalid plan ID');
    }
    await Campaign.update(campaign, { where: { id, OrganisationId } });
}

const deletePhoto = async (photo_id) => {
    const photo = await CampaignPix.findByPk(photo_id);
    if (!photo) throw new ErrorHandler(400, 'Image not found');
    const photoParts = photo.location.split('/');
    const photoName = photoParts[photoParts.length - 1];
    const filePath = path.join('uploads/campaign_photos', photoName);
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.log(err)
            }
        });
    }
    CampaignPix.destroy({ where: { id: photo_id } });
}

const _delete = async (id, OrganisationId) => {
    const [photos] = await Promise.all([
        CampaignPix.findAll({ CampaignId: id }),
        Campaign.update({ deleted: true }, { where: { id, OrganisationId } })
    ]);
    CampaignPix.destroy({ where: { CampaignId: id } });

    photos.forEach(photo => {
        const photoParts = photo.location.split('/');
        const photoName = photoParts[photoParts.length - 1];
        const filePath = path.join('uploads/campaign_photos', photoName);
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.log(err)
                }
            });
        }
    });
}

const getCampaignDonationDetails = async campaignId => {
    const donations = await Donation.findAll({ where: { CampaignId: campaignId, status: 'success' }, raw: true });
    return donations.map(donation => {
        if (!donation.donor_anonymous) {
            donation.donor_name = 'Anonymous';
        }
        return { ...donation, amount: donation.amount / 100 };
    });
}


const getTotalCampaigns = async (organisationId = null) => {
    let organisation = {};
    if (organisationId) organisation.OrganisationId = organisationId;
    const campaignCount = await Campaign.count({
        where: { ...organisation },
        raw: true
    });
    return campaignCount;
}

const sanitize = rawCampaign => {
    const campaign = rawCampaign.toJSON ? rawCampaign.toJSON() : rawCampaign;
    campaign.organisation_id = campaign.OrganisationId;
    // campaign.plan = campaign.Plan;
    campaign.organisation = campaign.Organisation;
    // campaign.plan_id = campaign.PlanId;
    // delete campaign.Plan
    delete campaign.Organisation;
    delete campaign.OrganisationId;
    // delete campaign.PlanId;
    delete campaign.organisation_id;
    delete campaign.deleted;
    return campaign;
}


module.exports = {
    create,
    uploadPhotos,
    findOne,
    findAll,
    update,
    _delete,
    deletePhoto,
    getTotalCampaigns
}