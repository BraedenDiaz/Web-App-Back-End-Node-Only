
const crypto = require("crypto");

const config = require("../config/config");
const cookies = require("./cookies");
const db = require("../config/db");

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

    return randomSecretBytes;
}

async function createUserSession(res, username)
{
    const sessionID = createSessionCookie(res);
    await db.insertNewUserSession(sessionID, username);
}

async function destroyUserSession(res, sessionID)
{
    cookies.deleteCookie(res, "sessionID");
    await db.removeUserSession(sessionID);
}

async function hasValidSession(req)
{
    const sessionID = cookies.getCookie(req, "sessionID");
    let username = null;

    if (!sessionID)
    {
        return false;
    }

    username = await db.getUserFromSession(sessionID);

    console.log("Username in Session:");
    console.log(username);

    if (!username)
    {
        return false;
    }

    return username;

}

module.exports = {
    createUserSession: createUserSession,
    hasValidSession: hasValidSession,
    destroyUserSession: destroyUserSession
};