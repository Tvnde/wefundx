const { ErrorHandler } = require('./errorHandler');

exports.uploadFile = (file, folder = '') => {
    if (!file || Object.keys(file).length === 0) {
        return null;
    }

    // check file type
    const allowedFileTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!allowedFileTypes.includes(file.mimetype)) {
        throw new ErrorHandler(400, 'Unsupported file type');
    }
    const ext = file.name.split('.').pop();
    const photoName = `${process.hrtime()[1]}.${ext}`;
    const uploadPath = require('path').resolve(__dirname, `../uploads/${folder}`, photoName);
    file.mv(uploadPath);
    return `${process.env.API_URL}uploads/${folder}/${photoName}`;
}