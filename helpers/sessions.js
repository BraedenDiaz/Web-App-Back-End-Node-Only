
const crypto = require("crypto");
const config = require("../config/config");
const cookies = require("./cookies");

function createSessionCookie(res)
{
    const randomSecretBytes = crypto.randomBytes(config.SESSION_KEY_BYTE_SIZE).toString("hex");
    let sessionCookIeStringOptions = "";

    if (config.SESSION_HTTP_ONLY)
    {
        sessionCookIeStringOptions += "HttpOnly;"
    }

    sessionCookIeStringOptions += ` SameSite=${config.SESSION_SAME_SITE};`;

    if (config.SESSION_HTTPS)
    {
        sessionCookIeStringOptions += " Secure;";
    }

    cookies.setCookieValue(
        res,
        config.SESSION_COOKIE_NAME,
        randomSecretBytes,
        config.SESSION_DAYS_UNTIL_EXPIRE,
        config.SESSION_COOKIE_PATH,
        sessionCookIeStringOptions
    );
}

module.exports = {
    createSessionCookie: createSessionCookie
};