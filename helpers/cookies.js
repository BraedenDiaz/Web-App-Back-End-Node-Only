
const helpers = require("./helpers");

function setCookieValue(res, cookieName, value, daysUntilExpire = null, path, additionalOptionsString)
{
    let cookieString = "";
    let futureDate = undefined;

    if (daysUntilExpire)
    {
        futureDate = new Date(Date.now() + helpers.daysToMilliseconds(daysUntilExpire)).toUTCString();
        cookieString = `${cookieName}=${value}; expires=${futureDate}; ${additionalOptionsString} path=${path}`;
    }
    else
    {
        cookieString = `${cookieName}=${value}; ${additionalOptionsString} path=${path}`;
    }

    res.setHeader("Set-Cookie", cookieString);
}

function getCookie(req, cookieName)
{
    if (!req.headers || !req.headers.cookie)
    {
        return null;
    }

    const cookieStringArr = req.headers.cookie.split(";");

    for (let cookieString of cookieStringArr)
    {
        cookieString = cookieString.trim();

        if (cookieString.startsWith(cookieName))
        {
            return cookieString.split("=")[1];
        }
    }

    return null;
}

function cookieExists(req, cookieName)
{
    return getCookie(req, cookieName) !== null;
}

function deleteCookie(res, cookieName)
{
    setCookieValue(res, cookieName, "", 0);
}

module.exports = {
    setCookieValue: setCookieValue,
    getCookie: getCookie,
    cookieExists: cookieExists,
    deleteCookie: deleteCookie
};