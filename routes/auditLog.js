const routes = require('express').Router();
const auditService = require('../services/auditService');
const httpResponse = require('../helpers/httpResponse');
const { isAuthenticated } = require('../middlewares/verifyToken');


routes.get('/', isAuthenticated, async (req, res, next) => {
    try {
        const { id: OrganisationId } = req.user.organisation;
        const auditLogs = await auditService.findAll({ where: { OrganisationId } });
        httpResponse.send(res, 200, 'Audit Logs Fetched', { auditLogs });
    } catch (err) {
        next(err);
    }
});


routes.get('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const { id } = req.params;
        const auditLog = await auditService.findOne(id);
        httpResponse.send(res, 200, 'Audit Log Fetched', { auditLog });
    } catch (err) {
        next(err);
    }
});


module.exports = routes;