const routes = require('express').Router();
const bankService = require('../services/bankService');
const httpResponse = require('../helpers/httpResponse');
const { isAuthenticated } = require('../middlewares/verifyToken');

routes.post('/', isAuthenticated, async (req, res, next) => {
    try {
        const bankAccount = await bankService.create({ ...req.body, organisation_id: req.user.organisation.id });
        httpResponse.send(res, 201, 'Bank Account Created', { bankAccount });
    } catch (err) {
        next(err);
    }
});


routes.get('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const { id } = req.params;
        const bankAccount = await bankService.findOne(id);
        httpResponse.send(res, 200, 'Bank Account Fetched', { bankAccount });
    } catch (err) {
        next(err);
    }
});


routes.put('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const { id } = req.params;
        await bankService.update(req.body, id);
        httpResponse.send(res, 200, 'Update successful');
    } catch (err) {
        next(err);
    }
});


routes.delete('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const { id } = req.params;
        await bankService._delete(id);
        httpResponse.send(res, 200, 'Bank Account Deleted');
    } catch (err) {
        next(err);
    }
});

module.exports = routes;