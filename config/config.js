"use strict";

module.exports = {
    WEB_SERVER_PORT: process.env.WEB_SERVER_PORT || 8080,
    MySQL_HOST: process.env.MySQL_HOST,
    MySQL_DB_PASSWORD: process.env.MySQL_DB_PASSWORD,
    MySQL_USER: process.env.MySQL_USER,
    MySQL_DB_NAME: process.env.MySQL_DB_NAME,

    SALT_BYTE_SIZE: 128,
    PASSWORD_HASH_ITERATIONS: 100000,
    PASSWORD_HASH_BYTE_LENGTH: 512,
    PASSWORD_HASH_DIGEST: "sha512"
};