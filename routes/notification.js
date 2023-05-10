const routes = require('express').Router();
const httpResponse = require('../helpers/httpResponse');
const { isAuthenticated } = require('../middlewares/verifyToken');
const { Notification } = require('../models');

routes.get('/', isAuthenticated, async (req, res, next) => {
    try {
        const { id: organisationId } = req.user.organisation;
        const notifications = await Notification.findAll({ where: { organisation_id: organisationId } });
        httpResponse.send(res, 200, 'Notifications Fetched', { notifications });
    } catch (err) {
        next(err);
    }
});

routes.get('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByPk(id);
        httpResponse.send(res, 200, 'Notification Fetched', { notification });
    } catch (err) {
        next(err);
    }
});

routes.put('/:id/seen', isAuthenticated, async (req, res, next) => {
    try {
        const { id } = req.params;
        await Notification.update({ status: 'seen' }, { where: { id } });
        httpResponse.send(res, 200, 'Notification Marked as Seen');
    } catch (err) {
        next(err);
    }
});


module.exports = routes;