
function daysToMilliseconds(days)
{
    return 1000 * 60 * 60 * 24 * days;
}

function setCookieValue(res, cookieName, value, daysUntilExpire = null, path, additionalOptionsString)
{
    let cookieString = "";
    let futureDate = undefined;

    if (daysUntilExpire)
    {
        futureDate = new Date(Date.now() + daysToMilliseconds(daysUntilExpire)).toUTCString();
        cookieString = `${cookieName}=${value}; expires=${futureDate}; ${additionalOptionsString} path=${path}`;
    }
    else
    {
        cookieString = `${cookieName}=${value}; ${additionalOptionsString} path=${path}`;
    }

    console.log("Cookie String:");
    console.log(cookieString);

    res.setHeader("Set-Cookie", cookieString);
}

function getCookie(req, cookieName)
{
    const cookieStringArr = req.headers.cookie.split(";");

    console.log(cookieStringArr);

    for (let cookieString of cookieStringArr)
    {
        cookieString = cookieString.trim();
        console.log(cookieString);

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