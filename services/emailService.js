'use strict';

const { Buffer } = require('buffer');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const businessName = 'WeFundx';

const options = {
    viewEngine: {
        extName: '.hbs',
        layoutsDir: path.join(__dirname, '../views/emails/'),
    },
    viewPath: path.join(__dirname, '../views/emails/')
};

let transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true, // true for 465, false for other ports,
    pool: true,
    rateLimit: 20,
    auth: {
        user: 'noreply@wefundx.com',
        pass: 'Change+this1#'
    }
});
transporter.use('compile', hbs(options));

const BASE_URL = process.env.BASE_URL;
const SENT_FROM = 'noreply@wefundx.com';

const sendMail = (to, subject, template, data) => {
    let mailOptions = {
        from: businessName + ' <' + SENT_FROM + '>',
        to: to,
        subject: subject,
        template: template,
        context: data
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        // console.log('Message sent: %s', info.messageId);
    });
}

module.exports = {
    sendConfirmationEmail: function (user) {
        const email_b64 = Buffer.from(user.email).toString('base64url');
        const hash = crypto.createHash('md5').update(user.email + process.env.EMAIL_HASH_STRING).digest('hex');

        const data = {
            user: user.fullname.split(' ')[0],
            url: BASE_URL + 'auth/verify/' + email_b64 + '-' + hash,
            base_url: BASE_URL
        };
        const subject = "Verify your email address";
        const template = 'verifyAccount';
        sendMail(user.email, subject, template, data);
    },

    sendPasswordResetLink: function (user) {
        if (!user) return false;
        const email_b64 = Buffer.from(user.email).toString('base64url');
        const hash = crypto.createHash('md5').update(user.email + process.env.EMAIL_HASH_STRING).digest('hex');

        const data = {
            user: user.lastname,
            // url: BASE_URL + 'auth/password-reset/' + email_b64 + '/' + hash,
            url: BASE_URL + 'auth/password-reset/' + email_b64 + '-' + hash,
            base_url: BASE_URL
        };
        const subject = businessName + " Password Reset Link";
        const template = 'passwordReset';
        sendMail(user.email, subject, template, data);
    },

    inviteTeamMember: function (user, organisation) {
        if (!user) return false;
        const email_b64 = Buffer.from(user.email).toString('base64url');
        const hash = crypto.createHash('md5').update(user.email + process.env.EMAIL_HASH_STRING).digest('hex');

        const data = {
            organisation,
            url: BASE_URL + 'auth/password-reset/' + email_b64 + '-' + hash,
            base_url: BASE_URL
        };
        const subject = "You've been invited to join an organisation on " + businessName;
        const template = 'teamInvite';
        sendMail(user.email, subject, template, data);
    }
}