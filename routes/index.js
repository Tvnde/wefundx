const routes = require('express').Router();

const usersRouter = require('./user');
const organisationRouter = require('./organisation');
const planRouter = require('./plan');
const campaignRouter = require('./campaign');
const accountRouter = require('./account');
const auditLogRoutes = require('./auditLog');
const payoutRoutes = require('./payout');
const donationRoutes = require('./donations');
const disputeRoutes = require('./dispute');
const accountRoutes = require('./account');
const notificationRoutes = require('./notification');

routes.get('/', (req, res) => {
    res.status(200).json({ message: 'WeFundX API' });
});

routes.use('/users', usersRouter);
routes.use('/organisations', organisationRouter);
routes.use('/plans', planRouter);
routes.use('/campaigns', campaignRouter);
routes.use('/accounts', accountRouter);
routes.use('/audit-logs', auditLogRoutes);
routes.use('/payouts', payoutRoutes);
routes.use('/donations', donationRoutes);
routes.use('/payments', donationRoutes);
routes.use('/disputes', disputeRoutes);
routes.use('/accounts', accountRoutes);
routes.use('/notifications', notificationRoutes);

module.exports = routes;