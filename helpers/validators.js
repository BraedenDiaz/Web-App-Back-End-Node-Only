
const crypto = require("crypto");

function saltAndHashPassword(password)
{
    const salt = crypto.randomBytes(128).toString("base64");
    const iterations = 100000;

    const promise = new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, iterations, 512, "sha512", (err, derivedKey) => {
            if (err)
            {
                reject(`Password Salt and Hash Error: ${err}`);
            }
    
            resolve({
                hashedPassword: derivedKey.toString("hex"),
                salt: salt.toString("hex"),
                iterations: iterations
            });
        });
    });

    return promise;
}

function authenticatePassword(hashedPassword, salt, iterations, enteredPassword)
{
    const promise = new Promise((resolve, reject) => {
        crypto.pbkdf2(enteredPassword, salt, iterations, 512, "sha512", (err, derivedKey) => {
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