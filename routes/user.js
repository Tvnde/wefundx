const routes = require('express').Router();
const userService = require('../services/userService');
const organisationService = require('../services/organisationService');
const emailService = require('../services/emailService');
const httpResponse = require('../helpers/httpResponse');
const { ErrorHandler } = require('../helpers/errorHandler');
const { isAuthenticated, isAdmin } = require('../middlewares/verifyToken');


routes.get('/', isAuthenticated, isAdmin, async (req, res, next) => {
    try {
        const users = await userService.list({});
        httpResponse.send(res, 200, 'Users Fetched', { users });
    } catch (err) {
        next(err);
    }
});

routes.get('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await userService.view({ where: { id }, raw: true });
        httpResponse.send(res, 200, 'User Fetched', { user });
    } catch (err) {
        next(err);
    }
});

routes.get('/:id/organisations', isAuthenticated, async (req, res, next) => {
    try {
        const { id: user_id } = req.params;
        const organisations = await organisationService.list({ where: { user_id, status: 'active' } });
        httpResponse.send(res, 200, 'User Organisations Fetched', { organisations });
    } catch (err) {
        next(err);
    }
});

routes.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { code, message, user } = await userService.login(email, password);
        httpResponse.send(res, code, message, { user });
    } catch (err) {
        next(err);
    }
});

routes.post('/', async (req, res, next) => {
    try {
        const newUser = await userService.register(req.body);
        httpResponse.send(res, 201, 'User created', newUser);
    } catch (err) {
        next(err);
    }
});

routes.put('/activate', async (req, res, next) => {
    try {
        const { email_hash, hash_string } = req.body;
        const user = await userService.activateAccount(email_hash, hash_string);
        httpResponse.send(res, 200, 'Account activated', { user });
    } catch (err) {
        next(err);
    }
});

routes.post('/send-password-reset-email', async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await userService.view({ where: { email, status: 'inactive' } });
        if (!user) throw new ErrorHandler(400, 'There is no account associated with this email');

        user.email = email;
        emailService.sendPasswordResetLink(user);
        httpResponse.send(res, 200, 'A password reset link has been sent to your email');
    } catch (err) {
        next(err);
    }
});

routes.post('/resend-verification-email', async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await userService.view({ where: { email, status: 'inactive' } });
        if (!user) throw new ErrorHandler(400, 'There is no inactive account associated with this email');

        user.email = email;
        emailService.sendConfirmationEmail(user);
        httpResponse.send(res, 200, 'Verification email sent');
    } catch (err) {
        next(err);
    }
});

routes.post('/reset-password', async (req, res, next) => {
    try {
        const { email_hash, hash_string, password } = req.body;
        const { id: user_id } = await userService.verifyPasswordResetLink(email_hash, hash_string);
        await userService.resetPassword(password, user_id);
        httpResponse.send(res, 200, 'Password successfully changed');
    } catch (err) {
        next(err);
    }
});

routes.post('/change-password', isAuthenticated, async (req, res, next) => {
    try {
        const { old_password, new_password } = req.body;
        const { id: user_id } = req.user;
        await userService.changePassword(old_password, new_password, user_id);
        httpResponse.send(res, 200, 'Password successfully changed');
    } catch (err) {
        next(err);
    }
});

routes.put('/', isAuthenticated, async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        await userService.update(req.body, userId);
        httpResponse.send(res, 200, 'User Updated');
    } catch (err) {
        next(err);
    }
});


module.exports = routes;