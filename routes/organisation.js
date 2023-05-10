const routes = require('express').Router();
const organisationService = require('../services/organisationService');
const AuditService = require('../services/auditService');
const httpResponse = require('../helpers/httpResponse');
const { isAuthenticated, isAdmin } = require('../middlewares/verifyToken');
const { ErrorHandler } = require('../helpers/errorHandler');
const zip = require('express-zip');

const auditModel = 'organisation';

routes.post('/', isAuthenticated, async (req, res, next) => {
    try {
        const organisation = await organisationService.create({ ...req.body, user_id: req.user.id });
        httpResponse.send(res, 201, 'Organisation Created', { organisation });
    } catch (err) {
        next(err);
    }
});

routes.post('/:id/logo', isAuthenticated, async (req, res, next) => {
    try {
        const { id: organisationId } = req.user.organisation;
        const logo_url = await organisationService.uploadLogo(organisationId, req.files);
        httpResponse.send(res, 201, 'Upload successful', { logo_url });
        await AuditService.create(req, `uploaded logo`, auditModel);
    } catch (err) {
        next(err);
    }
});


routes.get('/', async (req, res, next) => {
    try {
        const { type: organisation_type } = req.query;
        const criteria = {};
        if (organisation_type) {
            criteria.organisation_type = organisation_type;
        }
        const organisations = await organisationService.list({ where: criteria });
        httpResponse.send(res, 200, 'Organisations Fetched', { organisations });
    } catch (err) {
        next(err);
    }
});


routes.get('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const { id } = req.params;
        const organisation = await organisationService.findOne(id, 'all');
        httpResponse.send(res, 200, 'Organisation Fetched', { organisation });
    } catch (err) {
        next(err);
    }
});


routes.get('/:id/directors', isAuthenticated, async (req, res, next) => {
    try {
        const { id: organisation_id } = req.user.organisation;
        const directors = await organisationService.getDirectors(organisation_id);
        httpResponse.send(res, 200, 'Directors Fetched', { directors });
    } catch (err) {
        next(err);
    }
});


routes.post('/:id/directors', isAuthenticated, async (req, res, next) => {
    try {
        req.body.organisation_id = req.user.organisation.id;
        const director = await organisationService.addDirector(req);
        httpResponse.send(res, 201, 'Director Added', { director });
        await AuditService.create(req, `added new director`, auditModel);
    } catch (err) {
        next(err);
    }
});


routes.patch('/:id/documents', isAuthenticated, async (req, res, next) => {
    try {
        const { id: organisationId } = req.params;
        const { status } = req.query;
        if (!['accepted', 'rejected'].includes(status)) {
            throw new ErrorHandler(400, 'Invalid document status');
        }
        await organisationService.update({ body: { status } }, organisationId);
        httpResponse.send(res, 200, 'Document status updated');
    } catch (err) {
        next(err);
    }
});


routes.get('/:id/teams', isAuthenticated, async (req, res, next) => {
    try {
        const { id: organisation_id } = req.user.organisation;
        const teams = await organisationService.getTeams(organisation_id);
        httpResponse.send(res, 200, 'Teams Fetched', { teams });
    } catch (err) {
        next(err);
    }
});

routes.get('/:id/teams/:team_member_id', isAuthenticated, async (req, res, next) => {
    try {
        const { team_member_id } = req.params;
        const { id: organisationId } = req.user.organisation;
        const team_member = await organisationService.getTeamMember(team_member_id, organisationId);
        httpResponse.send(res, 200, 'Team Member Fetched', { team_member });
    } catch (err) {
        next(err);
    }
});


routes.post('/:id/teams', isAuthenticated, async (req, res, next) => {
    try {
        req.body.organisation_id = req.user.organisation.id;
        await organisationService.addTeam(req.body);
        httpResponse.send(res, 201, 'Team Member Added');
        await AuditService.create(req, `added new team member`, auditModel);
    } catch (err) {
        next(err);
    }
});


routes.delete('/:id/teams/:team_id', isAuthenticated, async (req, res, next) => {
    try {
        const { team_id } = req.params;
        const { id: organisationId } = req.user.organisation;
        organisationService.deleteTeamMember(team_id, organisationId);
        httpResponse.send(res, 200, 'Team Member Deleted');
    } catch (err) {
        next(err);
    }
});


routes.get('/:id/campaigns', async (req, res, next) => {
    try {
        // const { id: organisationId } = req.user.organisation;
        const { id: organisationId } = req.params;
        const campaigns = await organisationService.getCampaigns(organisationId);
        httpResponse.send(res, 200, 'Campaigns Fetched', { campaigns });
    } catch (err) {
        next(err);
    }
});


routes.get('/:id/plans', async (req, res, next) => {
    try {
        // const { id: organisationId } = req.user.organisation;
        const { id: organisationId } = req.params;
        const plans = await organisationService.getPlans(organisationId);
        httpResponse.send(res, 200, 'Plans Fetched', { plans });
    } catch (err) {
        next(err);
    }
});


routes.get('/:id/donations', isAuthenticated, isAdmin, async (req, res, next) => {
    try {
        const { id: organisationId } = req.params;
        const donations = await organisationService.getDonations(organisationId);
        httpResponse.send(res, 200, 'Donations Fetched', { donations });
    } catch (err) {
        next(err);
    }
});


routes.get('/:id/dashboard', async (req, res, next) => {
    try {
        const { id: organisationId } = req.params;
        const reports = await organisationService.getDashboardStat(organisationId);
        httpResponse.send(res, 200, 'Organisation Reports', { ...reports });
    } catch (err) {
        next(err);
    }
});


routes.get('/:id/download-files', async (req, res, next) => {
    try {
        const { id: organisationId } = req.params;
        const docs = await organisationService.fetchDocuments(organisationId);
        res.zip(docs, 'org-file.zip');

    } catch (err) {
        next(err);
    }
});



routes.get('/:id/:scope', async (req, res, next) => {
    try {
        const scopes = ['basic', 'settings', 'documents'];
        const { id, scope } = req.params;
        if (!scopes.includes(scope)) {
            throw new ErrorHandler(400, 'Invalid organisation scope. You can use [\'setting\' or \'document\']');
        }
        const organisation = await organisationService.findOne(id, scope);
        httpResponse.send(res, 200, `Organisation ${scope} Fetched`, { organisation });
    } catch (err) {
        next(err);
    }
});


routes.put('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { id: organisationId } = req.user.organisation;
        if (id != organisationId) {
            throw new ErrorHandler(400, 'You don\'t have the privilege to update this organisation');
        }
        await organisationService.update(req, id);
        httpResponse.send(res, 200, 'Update successful');
        await AuditService.create(req, `updated ${auditModel}`, auditModel);
    } catch (err) {
        next(err);
    }
});


routes.patch('/:action', isAuthenticated, async (req, res, next) => {
    try {
        const { id: organisationId } = req.user.organisation;
        await organisationService.update(req, organisationId);
        httpResponse.send(res, 200, 'Operation successful');
        await AuditService.create(req, `updated ${organisation}`, auditModel);
    } catch (err) {
        next(err);
    }
});


routes.delete('/id', isAuthenticated, isAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        await organisationService._delete(id);
        httpResponse.send(res, 200, 'Organisation Deleted');
    } catch (err) {
        next(err);
    }
});

module.exports = routes;