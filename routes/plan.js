const routes = require('express').Router();
const planService = require('../services/planService');
const AuditService = require('../services/auditService');
const httpResponse = require('../helpers/httpResponse');
const { isAuthenticated, isOrgAccepted } = require('../middlewares/verifyToken');

const auditModel = 'plan';

routes.post('/', isAuthenticated, isOrgAccepted, async (req, res, next) => {
    try {
        const plan = await planService.create(req.body, req.user.organisation.id);
        httpResponse.send(res, 201, 'Plan Created', { plan });
        await AuditService.create(req, `created new ${auditModel}`, auditModel);
    } catch (err) {
        next(err);
    }
});


routes.get('/', async (req, res, next) => {
    try {
        const plans = await planService.findAll();
        httpResponse.send(res, 200, 'Plans Fetched', { plans });
    } catch (err) {
        next(err);
    }
});


routes.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const plan = await planService.findOne(id);
        httpResponse.send(res, 200, 'Plan Fetched', { plan });
    } catch (err) {
        console.log(err)
        next(err);
    }
});


routes.put('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { id: organisationId } = req.user.organisation;
        await planService.update(req.body, id, organisationId);
        httpResponse.send(res, 200, 'Update successful');
        await AuditService.create(req, `updated ${auditModel}`, auditModel);
    } catch (err) {
        next(err);
    }
});


routes.delete('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { id: organisationId } = req.user.organisation;
        await planService._delete(id, organisationId);
        httpResponse.send(res, 200, 'Plan Deleted');
        await AuditService.create(req, `deleted ${auditModel}`, auditModel);
    } catch (err) {
        next(err);
    }
});

module.exports = routes;