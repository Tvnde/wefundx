const routes = require('express').Router();
const donationService = require('../services/donationService');
const httpResponse = require('../helpers/httpResponse');
const { Organisation } = require('../models');
const { isAuthenticated, isAdmin } = require('../middlewares/verifyToken');
const { donationValidationRules, validate } = require('../middlewares/validators/donationRules');


routes.post('/', donationValidationRules(), validate, async (req, res, next) => {
    try {
        const donation = await donationService.create(req.body);
        httpResponse.send(res, 200, 'Donation  Saved', { donation });
    } catch (err) {
        next(err);
    }
});


routes.get('/verify/:reference', async (req, res, next) => {
    try {
        const { reference } = req.params;
        const donation = await donationService.completeDonation(reference);
        httpResponse.send(res, 200, 'Donation  Verified', { donation });
    } catch (err) {
        next(err);
    }
});


routes.get('/', isAuthenticated, isAdmin, async (req, res, next) => {
    try {
        const donation = await donationService.findAll({
            include: {
                model: Organisation,
                as: 'organisation',
                attributes: ['id', 'name', 'description', 'logo', 'phone', 'category', 'organisation_type', 'website', 'address', 'user_id', 'createdAt', 'updatedAt']
            }
        });
        httpResponse.send(res, 200, 'Donations  Fetched', { donation });
    } catch (err) {
        next(err);
    }
});


routes.get('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const { id } = req.params;
        const donation = await donationService.findOne(id);
        httpResponse.send(res, 200, 'Donation Fetched', { donation });
    } catch (err) {
        next(err);
    }
});


module.exports = routes;