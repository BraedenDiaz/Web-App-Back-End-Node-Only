"use strict";

/**
 * @author Braeden Diaz
 * 
 * Main configuration file used by all parts of the web server.
 */

module.exports = {

    // Web Server Configuration
    WEB_SERVER_PORT: process.env.WEB_SERVER_PORT || 8080,

    // MYSQL Database Configuration
    MySQL_HOST: process.env.MySQL_HOST,
    MySQL_DB_PASSWORD: process.env.MySQL_DB_PASSWORD,
    MySQL_USER: process.env.MySQL_USER,
    MySQL_DB_NAME: process.env.MySQL_DB_NAME,

    // Password Hash and Salt Configuration
    SALT_BYTE_SIZE: 32,                 // 256 bits
    PASSWORD_HASH_ITERATIONS: 150000,
    PASSWORD_HASH_BYTE_LENGTH: 64,      // 512 bits
    PASSWORD_HASH_DIGEST: "sha512",

    // Session Configuration
    SESSION_COOKIE_NAME: "sessionID",
    SESSION_KEY_BYTE_SIZE: 32,          // 256 bits
    SESSION_DAYS_UNTIL_EXPIRE: 1,
    SESSION_HTTP_ONLY: true,
    SESSION_SAME_SITE: "Lax",
    SESSION_HTTPS: false,               // Should be "true" when running over HTTPS
    SESSION_COOKIE_PATH: "/"
};