
const crypto = require("crypto");

function saltAndHashPassword(password)
{
    const salt = crypto.randomBytes(128).toString("base64");
    const iterations = 100000;
    const hash = crypto.pbkdf2Sync(password, salt, iterations, 512, "sha512");

    return {
        hashedPassword: hash.toString("hex"),
        salt: salt.toString("hex"),
        iterations: iterations
    };
}

function authenticatePassword(hashedPassword, salt, iterations, enteredPassword)
{
    return hashedPassword === crypto.pbkdf2Sync(enteredPassword, salt, iterations, 512, "sha512").toString("hex");
}

module.exports = {
    saltAndHashPassword: saltAndHashPassword,
    authenticatePassword: authenticatePassword
}