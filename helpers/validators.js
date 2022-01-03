"use strict";

const crypto = require("crypto");
const config = require("../config/config");

/**
 * @author Braeden Diaz
 * 
 * Contains functions used to validate usernames and passwords, salt and hash passwords, as
 * well as authenticate passwords for use in website registration, login, etc.
 * 
 */

/**
 * Hash and salt a plaintext password for later secure storage into a database.
 * 
 * @param {string} password A plaintext password.
 * @returns A hashed and salted version of the plaintext password.
 */
async function saltAndHashPassword(password)
{
    const salt = crypto.randomBytes(config.SALT_BYTE_SIZE).toString("hex");

    const promise = new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, config.PASSWORD_HASH_ITERATIONS, config.PASSWORD_HASH_BYTE_LENGTH, config.PASSWORD_HASH_DIGEST, (err, derivedKey) => {
            if (err)
            {
                reject(`Password Salt and Hash Error: ${err}`);
            }
    
            resolve(derivedKey.toString("hex") + salt);
        });
    });

    return promise;
}

/**
 * Authenticate a plaintext password with a hashed and salted password. This is typically used for login.
 * 
 * @param {string} hashedPasswordAndSalt The hashed and salt password you want to authenticate the enteredPassword with.
 * @param {string} enteredPassword The plaintext password to authenticate.
 * @returns True or False based on whether or not the enteredPassword authenticates to the hashed and salted password.
 */
async function authenticatePassword(hashedPasswordAndSalt, enteredPassword)
{
    const hashedPassword = hashedPasswordAndSalt.substr(0, hashedPasswordAndSalt.length - config.SALT_BYTE_SIZE * 2);
    const salt = hashedPasswordAndSalt.substr(-(config.SALT_BYTE_SIZE * 2));

    const promise = new Promise((resolve, reject) => {
        crypto.pbkdf2(enteredPassword, salt, config.PASSWORD_HASH_ITERATIONS, config.PASSWORD_HASH_BYTE_LENGTH, config.PASSWORD_HASH_DIGEST, (err, derivedKey) => {
            if (err)
            {
                reject(`Authenticate Password Error: ${err}`);
            }
    
            resolve(hashedPassword === derivedKey.toString("hex"));
        });
    });

    return promise;
}

/**
 * Validates a username string against a RegEx pattern to determine if it is
 * valid or not to be used as a username for the website.
 * 
 * @param {string} username The username to validate.
 * @returns True or False depedning on if the username is valid or not.
 */
function validateUsername(username)
{
    const validUsernamePattern = /^[a-zA-Z]{1}[a-zA-Z0-9]+$/;

    if (!validUsernamePattern.test(username))
    {
        return false;
    }

    return true;
}

/**
 * Validates a plaintext password string against a RegEx pattern to determine if
 * it is valid or not to be used as a password for the website.
 * 
 * @param {*} password The plaintext password to validate.
 * @returns True or False depedning on if the password is valid or not.
 */
function validatePassword(password)
{
    const validPasswordPattern = /^[a-zA-Z0-9_@#$*-]+$/

    if (password.length < 10)
    {
        return false;
    }

    if (!validPasswordPattern.test(password))
    {
        return false;
    }

    return true;
}

module.exports = {
    saltAndHashPassword: saltAndHashPassword,
    authenticatePassword: authenticatePassword,
    validateUsername: validateUsername,
    validatePassword: validatePassword
}