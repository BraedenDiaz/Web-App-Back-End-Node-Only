"use strict";

/**
 * @author Braeden Diaz
 * 
 * Contains functions used to set, retrieve, and manage cookies that are obtained from the client or cookies
 * that will be sent to the client.
 * 
 */

const helpers = require("./helpers");

/**
 * Create a new cookie, set its value, expiration date, path, and other options, and place it in the
 * passed in HTTP response header ready to be sent back to the client.
 * 
 * @param {http.ServerResponse} res The HTTP Reesponse Object.
 * @param {string} cookieName The name to give the cookie.
 * @param {any} value The value to set in the cookie.
 * @param {number} daysUntilExpire The number of days until the cookie should expire. Default is null (i.e. does not expire).
 * @param {string} path The website path the cookie should apply to. Default is the whole website (root).
 * @param {string} additionalOptionsString String of multiple semicolon-seprated key-value pairs of additional HTTP cookie options.
 */
function setCookieValue(res, cookieName, value, daysUntilExpire = null, path = "/", additionalOptionsString)
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

/**
 * Look for and retrieve the value for the passed in cookieName in the passed in HTTP request.
 * 
 * @param {http.IncomingMessage} req The HTTP Request Object.
 * @param {string} cookieName The name of the cookie to look for and retrieve.
 * @returns Returns the cookies value if found or null if not found.
 */
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

/**
 * Check if a cookie exists in the passed in request.
 * 
 * @param {http.IncomingMessage} req The HTTP Request Object.
 * @param {string} cookieName The name of the cookie to look for.
 * @returns True or False depending on if the cookie exists or not.
 */
function cookieExists(req, cookieName)
{
    return getCookie(req, cookieName) !== null;
}

/**
 * Delete a cookie in the client by setting it to expire immediately
 * in the passed in HTTP response header that should be sent back to
 * the client afterwards.
 * 
 * @param {http.ServerResponse} res The HTTP Reesponse Object.
 * @param {string} cookieName The name of the cookie to delete.
 */
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