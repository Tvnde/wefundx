
const send = (res, statusCode = 500, message, data, metadata) => {
    let response = {
        status: true,
        message: message || 'Server error'
    }

    if (statusCode < 300) {
        if (data) response.data = data
        if (metadata) response.metadata = metadata;
    }

    if (statusCode > 299) response = { ...response, status: false, error: { code: statusCode, errors: data } };

    return res.status(statusCode).json(response);
}

module.exports = {
    send
};