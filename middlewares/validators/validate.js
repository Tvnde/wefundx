const httpResponse = require('../../helpers/httpResponse');
const { validationResult } = require("express-validator");

module.exports = (req, res, next) => {
    const raw_errors = validationResult(req);

    if (raw_errors.isEmpty()) {
        return next();
    }
    const errors = raw_errors.errors.map(err => ({ field: err.param, message: err.msg }));

    return httpResponse.send(res, 400, 'Invalid Input', errors);
}