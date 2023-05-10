require('dotenv').config();
const env = process.env.NODE_ENV || 'development';

const config = {
    "development": {
        "username": process.env.DEV_DB_USER,
        "password": process.env.DEV_DB_PASSWORD,
        "database": process.env.DEV_DB_NAME,
        "host": process.env.DEV_DB_HOST,
        "dialect": "mysql"
    },
    "test": {
        "user": "root",
        "password": null,
    },
    "production": {
        "username": process.env.DB_USER,
        "password": process.env.DB_PASSWORD,
        "database": process.env.DB_NAME,
        "host": process.env.DB_HOST || 'localhost',
        "dialect": "mysql",
        "dialectOptions": {
            socketPath: "/var/run/mysqld/mysqld.sock"
        }

    }
}

const paystack_config = {
    test: {
        SECRET_KEY: process.env.PAYSTACK_TEST_SECRET_KEY
    },
    development: {
        SECRET_KEY: process.env.PAYSTACK_TEST_SECRET_KEY
    },
    production: {
        SECRET_KEY: process.env.PAYSTACK_SECRET_KEY
    }
}

module.exports = {
    config: config[env],
    paystack_config: paystack_config[env]
}
