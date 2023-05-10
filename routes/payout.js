const routes = require('express').Router();
const payoutService = require('../services/payoutService');
const AuditService = require('../services/auditService');
const httpResponse = require('../helpers/httpResponse');
const { isAuthenticated } = require('../middlewares/verifyToken');

routes.post('/', isAuthenticated, async (req, res, next) => {
    try {
        const payout = await payoutService.create({ ...req.body, organisation_id: req.user.organisation.id });
        httpResponse.send(res, 201, 'Payout Created', { payout });
        await AuditService.create(req, 'created new payout', 'payout');
    } catch (err) {
        next(err);
    }
});


routes.get('/', isAuthenticated, async (req, res, next) => {
    try {
        const payouts = await payoutService.findAll();
        httpResponse.send(res, 200, 'Payouts Fetched', { payouts });
    } catch (err) {
        next(err);
    }
});


routes.get('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const { id } = req.params;
        const payout = await payoutService.findOne(id);
        httpResponse.send(res, 200, 'Payout Fetched', { payout });
    } catch (err) {
        next(err);
    }
});


routes.put('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const { id } = req.params;
        await payoutService.update(req.body, id);
        httpResponse.send(res, 200, 'Update successful');
        await AuditService.create(req, 'update payout', 'payout');
    } catch (err) {
        next(err);
    }
});


routes.delete('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const { id } = req.params;
        await payoutService._delete(id);
        httpResponse.send(res, 200, 'Payout Deleted');
        await AuditService.create(req, 'deleted payout', 'payout');
    } catch (err) {
        next(err);
    }
});

module.exports = routes;