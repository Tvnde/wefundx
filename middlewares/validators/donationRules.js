const { body, check } = require('express-validator');
const validate = require('./validate');

module.exports = {
    donationValidationRules: () => {
        return [
            body('amount').isNumeric().trim().withMessage("amount cannot be empty and must be a number"),
            body('donor_name').exists().withMessage("donor_name can not be empty!").isLength({ max: 80 }).escape().withMessage("donor_name must not be more than 80 characters"),
            body('donor_email').exists().withMessage("donor_email can not be empty!").isLength({ max: 80 }).escape().withMessage("donor_email must not be more than 80 characters"),
            body('campaign_id').isNumeric().trim().withMessage("campaign_id cannot be empty and must be a number")
        ];
    },

    validate
}