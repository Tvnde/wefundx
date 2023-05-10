const jwt = require('jsonwebtoken');
const { ErrorHandler } = require('../helpers/errorHandler');

module.exports = {
    isAuthenticated(req, res, next) {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            if (!token) return res.sendStatus(401); // Unauthorized

            jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
                if (err) {
                    return res.sendStatus(403); // forbidden
                }
                req.user = payload;
                next();
            });
        } catch (err) {
            next(err);
        }
    },

    isAdmin(req, res, next) {
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            return res.sendStatus(403);
        }
    },

    isOrgAccepted(req, res, next) {
        if (req.user && req.user.organisation.status === 'accepted') {
            next();
        } else {
            const message = {
                'pending': 'Your organisations\' documents are yet to be verified. Make sure you\'ve submitted all the required documents',
                'rejected': 'One or more of your organisations\' documents were rejected. Check your email for details or contact support'
            }
            throw new ErrorHandler(403, message[req.user.organisation.status] || 'Your organisation hasn\'t been verified yet');
        }
    }
}