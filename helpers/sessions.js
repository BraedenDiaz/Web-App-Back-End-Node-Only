"use strict";

/**
 * @author Braeden Diaz
 * 
 * Contains functions used to create, destroy, and validate user sessions.
 * 
 */

const crypto = require("crypto");

const config = require("../config/config");
const cookies = require("./cookies");
const db = require("../config/db");

/**
 * Creates a session cookie and sets it in the HTTP response header so that it can be
 * used by the client for sessions.
 * 
 * Note that this function assumes other session creation functionality is also handled
 * along with this. I.e. adding the session to a session store.
 * 
 * @param {http.ServerResponse} res The HTTP Reesponse Object.
 * @returns A hex string of the generated session ID.
 */
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

/**
 * Creates a new user session for a user by creating a new session cookie, obtaining a session ID,
 * and inserting that into the session store (database).
 * 
 * @param {http.ServerResponse} res The HTTP Reesponse Object.
 * @param {string} username The username of the user to create a session for.
 * @returns A Promise forwarded from the database inserting the new user session.
 */
async function createUserSession(res, username)
{
    const sessionID = createSessionCookie(res);
    return await db.insertNewUserSession(sessionID, username);
}
/**
 * Destorys a user's session by deleteing the session cookie and removing
 * the session from the database.
 * 
 * @param {http.ServerResponse} res The HTTP Reesponse Object.
 * @param {string} sessionID The session ID string of the session to delete.
 * @returns A Promise forwarded from the database removing the user's session/
 */
async function destroyUserSession(res, sessionID)
{
    cookies.deleteCookie(res, "sessionID");
    return await db.removeUserSession(sessionID);
}

/**
 * Check if the passed in request contains a valid session.
 * 
 * @param {http.IncomingMessage} req The HTTP Request Object.
 * @returns The username if the request has a valid session cookie, otherwise, returns false.
 */
async function hasValidSession(req)
{
    const sessionID = cookies.getCookie(req, "sessionID");
    let username = null;

    const promise = new Promise(async (resolve, reject) => {
        // If the session cookie (therefore, sessionID) does not exist, resolve the promise with "false"
        if (!sessionID)
        {
            resolve(false);
        }
        
        // Will only return a username for sessions that have NOT expired
        username = await db.getUserFromSession(sessionID);
    
        // Resolve the promise with "false" if the session ID was not found in the database
        if (!username)
        {
            resolve(false);
        }
    
        // Resolve the promise with the username associated with the sessionID as it's valid at this point
        resolve(username);
    });

    return promise;

}

module.exports = {
    createUserSession: createUserSession,
    hasValidSession: hasValidSession,
    destroyUserSession: destroyUserSession
};