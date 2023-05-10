const axios = require('axios');
const { ErrorHandler } = require('../helpers/errorHandler');


module.exports = class APIRequest {
    option = { headers: { 'Content-Type': 'application/json' } };

    constructor(options) {
        this.option = {
            headers: { 'Content-Type': 'application/json' },
            ...options
        };
    }


    async get(url, params = {}) {
        this.option.params = params;
        try {
            const response = await axios.get(url, this.option);
            return response.data;
        } catch (err) {
            throw new ErrorHandler(err.response.status, err.response.data.message);
        }
    }

    async post(url, body = {}) {
        try {
            const response = await axios.post(url, body, this.option);
            return response.data;
        } catch (err) {
            throw new ErrorHandler(err.response.status, err.response.data.message);
        }
    }
}