const { ErrorHandler } = require('../helpers/errorHandler');
const { BankAccount } = require('../models');
const { buildCriteria } = require('../services/utilityService');

const create = async (bankData) => {
    const account = await view({ where: { account_number: bankData.account_number } });
    if (account) {
        throw new ErrorHandler(400, 'Account number not unique');
    }
    const newBankAccount = await BankAccount.create({ ...bankData });
    return findOne(newBankAccount.id);
}


const view = async (queryCriteria) => {
    const { criteria, options } = buildCriteria(queryCriteria);
    return BankAccount.findOne({ where: criteria, ...options });
}

const findOne = async id => {
    const bankAccount = await view({
        where: { id }
    });
    if (!bankAccount) throw new ErrorHandler(404, 'Bank Account not found');
    return sanitize(bankAccount);
}

const update = async (bankAccount, id) => {
    const account = await view({ where: { account_number: bankData.account_number } });
    if (account && account.id != id) {
        throw new ErrorHandler(400, 'Account number not unique');
    }
    await BankAccount.update(bankAccount, { where: { id } });
}

const _delete = async (id) => {
    return BankAccount.update({ deleted: true }, { where: { id } });
}

const sanitize = rawBankAccount => {
    const bankAccount = rawBankAccount.toJSON();
    delete bankAccount.deleted;
    return bankAccount;
}


module.exports = {
    create,
    findOne,
    update,
    _delete
}