
const crypto = require("crypto");
const config = require("../config/config");

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

function validateUsername(username)
{
    const validUsernamePattern = /^[a-zA-Z]{1}[a-zA-Z0-9]+$/;

    if (!validUsernamePattern.test(username))
    {
        return false;
    }

    return true;
}

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