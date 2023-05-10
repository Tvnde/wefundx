const { User, Organisation, UserOrganisation } = require('../models');
const jwt = require('jsonwebtoken');
const { ErrorHandler } = require('../helpers/errorHandler');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const saltRounds = 10;
const { buildCriteria } = require('./utilityService');
const emailService = require('./emailService');

const login = async (email, password) => {
    const user = await User.findOne({ where: { email } });

    if (!user) throw new ErrorHandler(404, 'The email or password is incorrect');

    const match = await bcrypt.compare(password, user.password);

    if (!match) throw new ErrorHandler(400, 'Email and password doesn\'t match');

    if (user.status == 'inactive') throw new ErrorHandler(422, 'User account is inactive.');

    let organisation = null;
    if (user.active_organisation) {
        organisation = await Organisation.findOne({
            where: { id: user.active_organisation },
            attributes: ['id', 'name', 'description', 'category', 'organisation_type', 'phone', 'status']
        });
    }

    const payload = {
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
        organisation
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "72h" });
    return {
        code: 200,
        user: { token, ...payload },
        message: 'Logged in'
    };
}

const register = async (user) => {
    const existingUser = await User.findOne({ where: { email: user.email } });
    if (existingUser) throw new ErrorHandler(400, 'A user already exist with this email');

    const password = await bcrypt.hash(user.password, saltRounds);
    const newUser = await User.create({ ...user, password });
    const newuser = sanitizeUser(newUser);
    emailService.sendConfirmationEmail(newuser);

    // terrible
    newuser.token = jwt.sign(newuser, process.env.JWT_SECRET, { expiresIn: "72h" });
    return newuser;
}


const activateAccount = async (email_hash, hash_string) => {
    if (!email_hash || !hash_string) {
        throw new ErrorHandler(400, 'Email or hash not found');
    }
    const email = Buffer.from(email_hash, 'base64url').toString('ascii');
    const user = await view({ where: { email } });

    if (!user) throw new ErrorHandler(400, 'Account not found');

    const hash = crypto.createHash('md5').update(user.email + process.env.EMAIL_HASH_STRING).digest('hex');

    if (hash_string !== hash) {
        throw new ErrorHandler(400, 'Invalid hash. couldn\'t verify your email');
    }
    user.status = 'active';
    await update({ status: user.status }, user.id);
    return { ...user, status: 'active' };
}

const verifyPasswordResetLink = async (email_hash, hash_string) => {
    if (!email_hash || !hash_string) {
        throw new ErrorHandler(400, 'Email or hash not found');
    }
    const email = Buffer.from(email_hash, 'base64url').toString('ascii');
    const user = await view({ where: { email } });
    if (!user) throw new ErrorHandler(400, 'User not found');

    const hash = crypto.createHash('md5').update(email + process.env.EMAIL_HASH_STRING).digest('hex');
    if (hash_string !== hash) {
        throw new ErrorHandler(400, 'Invalid hash. couldn\'t verify your email');
    }
    return { id: user.id, status: true };
}

const resetPassword = async (newPassword, user_id) => {
    if (!newPassword) throw new ErrorHandler(400, 'Password can not be empty');
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    return update({ password: passwordHash }, user_id);
}

const changePassword = async (oldPassword, newPassword, user_id) => {
    const user = await view({ where: { id: user_id } });
    if (!user) throw new ErrorHandler(400, 'User not found');

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) throw new ErrorHandler(400, 'Wrong current password');

    return resetPassword(newPassword, user_id);
}


const view = async (queryCriteria) => {
    const { criteria, options } = buildCriteria(queryCriteria);
    const rawUser = await User.findOne({ where: criteria, ...options });
    rawUser.organisation = await Organisation.findOne({
        where: { id: rawUser.active_organisation || 0 }, raw: true
    });
    return sanitizeUser(rawUser);
}

const list = async (criteria = {}) => {
    const users = await User.findAll({ ...criteria, raw: true });
    return users.map(user => sanitizeUser(user));
}

const update = async (userData, userId) => {
    if (userData.active_organisation) {
        const userOrg = await UserOrganisation.findOne({ where: { user_id: userId, organisation_id: userData.active_organisation } });
        if (!userOrg) throw new ErrorHandler(400, 'User doesn\'t belong to this organisation');
    }
    return User.update(userData, { where: { id: userId } });
}

const sanitizeUser = rawUser => {
    if (!rawUser) return null;
    const user = rawUser.toJSON && rawUser.toJSON() || rawUser;
    delete user.password;
    delete user.deleted
    return user;
}

module.exports = {
    login,
    register,
    view,
    list,
    update,
    activateAccount,
    verifyPasswordResetLink,
    resetPassword,
    changePassword
}