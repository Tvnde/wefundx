const routes = require('express').Router();
const campaignService = require('../services/campaignService');
const AuditService = require('../services/auditService');
const httpResponse = require('../helpers/httpResponse');
const { isAuthenticated, isOrgAccepted } = require('../middlewares/verifyToken');

const auditModel = 'campaign';

routes.post('/', isAuthenticated, isOrgAccepted, async (req, res, next) => {
    try {
        const campaign = await campaignService.create({ ...req.body, OrganisationId: req.user.organisation.id });
        httpResponse.send(res, 201, 'Campaign Created', { campaign });
        await AuditService.create(req, `created new ${auditModel}`, auditModel);
    } catch (err) {
        next(err);
    }
});


routes.get('/', async (req, res, next) => {
    try {
        const campaigns = await campaignService.findAll({ where: { status: 'active' } });
        httpResponse.send(res, 200, 'Campaigns Fetched', { campaigns });
    } catch (err) {
        next(err);
    }
});


routes.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const campaign = await campaignService.findOne(id);
        httpResponse.send(res, 200, 'Campaign Fetched', { campaign });
    } catch (err) {
        next(err);
    }
});


routes.put('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { id: organisationId } = req.user.organisation;
        await campaignService.update(req.body, id, organisationId);
        httpResponse.send(res, 200, 'Update successful');
        await AuditService.create(req, `updated ${auditModel}`, auditModel);
    } catch (err) {
        next(err);
    }
});


routes.post('/:id/photos', isAuthenticated, async (req, res, next) => {
    try {
        const { id: campaignId } = req.params;
        const { id: organisationId } = req.user.organisation;
        const campaignImages = await campaignService.uploadPhotos(campaignId, organisationId, req.files);
        httpResponse.send(res, 201, 'Upload successful', { campaignImages });
    } catch (err) {
        next(err);
    }
});


routes.delete('/delete-photo/:id', isAuthenticated, async (req, res, next) => {
    try {
        const { id: photoId } = req.params;
        await campaignService.deletePhoto(photoId);
        httpResponse.send(res, 200, 'Photo Deleted');
    } catch (err) {
        next(err);
    }
});


routes.delete('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { id: organisationId } = req.user.organisation;
        await campaignService._delete(id, organisationId);
        httpResponse.send(res, 200, 'Campaign Deleted');
        await AuditService.create(req, `deleted ${auditModel}`, auditModel);
    } catch (err) {
        next(err);
    }
});

module.exports = routes;