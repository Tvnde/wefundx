const { check } = require('express-validator');
const { User } = rquire('../models');
const validate = require('./validate');

export default validate;

module.exports = () => {
    return [
        check('fullname').not().isEmpty().withMessage('fullname must be specified'),
        // check('user_type').not().isEmpty().withMessage('user_type must be specified'),
        check('email').not().isEmpty().withMessage('email must be specified'),
        check('password').not().isEmpty().withMessage('password must be specified'),
    ];
}

export const loginRules = () => {
    return [
        check('email').exists().withMessage('Email/username field must be provided'),
        check('password').exists().withMessage('Password field must be provided')
    ]
}
