const routes = require('express').Router();
const disputeService = require('../services/disputeService');
const AuditService = require('../services/auditService');
const httpResponse = require('../helpers/httpResponse');
const { isAuthenticated } = require('../middlewares/verifyToken');

const auditModel = 'dispute';

routes.post('/', isAuthenticated, async (req, res, next) => {
    try {
        const dispute = await disputeService.create(req.body, req.user.organisation.id);
        httpResponse.send(res, 201, 'Dispute Created', { dispute });
        await AuditService.create(req, `created new ${auditModel}`, auditModel);
    } catch (err) {
        next(err);
    }
});


routes.get('/', async (req, res, next) => {
    try {
        const disputes = await disputeService.findAll();
        httpResponse.send(res, 200, 'Disputes Fetched', { disputes });
    } catch (err) {
        next(err);
    }
});


routes.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const dispute = await disputeService.findOne(id);
        httpResponse.send(res, 200, 'Dispute Fetched', { dispute });
    } catch (err) {
        next(err);
    }
});


routes.put('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const { id } = req.params;
        await disputeService.update(req.body, id);
        httpResponse.send(res, 200, 'Update successful');
        await AuditService.create(req, `updated ${auditModel}`, auditModel);
    } catch (err) {
        next(err);
    }
});


routes.delete('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const { id } = req.params;
        await disputeService._delete(id);
        httpResponse.send(res, 200, 'Dispute Deleted');
        await AuditService.create(req, `deleted ${auditModel}`, auditModel);
    } catch (err) {
        next(err);
    }
});

module.exports = routes;