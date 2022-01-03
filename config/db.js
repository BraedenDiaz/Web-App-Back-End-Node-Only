"use strict";

/**
 * @author Braeden Diaz
 * 
 * Main database API to interact with the website's MySQL database.
 */

const mysql = require("mysql2");

const helpers = require("../helpers/helpers");
const config = require("./config");

const databaseConnectionPool = mysql.createPool({
    host: config.MySQL_HOST,
    user: config.MySQL_USER,
    password: config.MySQL_DB_PASSWORD,
    database: config.MySQL_DB_NAME
});

/**
 * Check if a specific username exists in the database.
 * 
 * @param {string} username The username to check.
 * @returns True or False depending on if the username was found in the database or not.
 */
async function userExists(username)
{
    const queryString = 
    `
        SELECT username
        FROM Users
        WHERE username='${username}';
    `;

    const promise = new Promise((resolve, reject) => {
        databaseConnectionPool.query(queryString, (err, result) => {
            if (err)
            {
                reject(`Database User Exists Query Error: ${err}`);
                return;
            }
    
            return resolve(result.length > 0);
        });
    })

    return promise;

}

/**
 * Insert a new user into the databse.
 * 
 * Be sure to insert the hashed and salted version of the user's password
 * and not the plaintext one!
 * 
 * @param {string} username The username to insert.
 * @param {string} password The hashed and salted version of the user's password.
 * @returns 
 */
async function insertNewUser(username, password)
{
    const queryString = 
    `
        INSERT INTO Users (username, password)
        VALUES ('${username}', '${password}');
    `;

    if (await userExists(username))
    {
        throw new Error(`User already exists!`);
    }

    const promise = new Promise((resolve, reject) => {
        databaseConnectionPool.query(queryString, (err, result) => {
            if (err)
            {
                reject(`Database Insert Error: ${err}`);
                return;
            }

            resolve(result);
        });
    });

    return promise;
}

/**
 * Get the user ID for a specific username.
 * 
 * @param {string} username The username to find the ID for.
 * @returns The userID for the passed in username.
 */
async function getUserID(username)
{
    const promise = new Promise((resolve, reject) => {
        const getUserIdQuery = 
        `
            SELECT userID
            FROM Users
            WHERE username = '${username}';
        `;
    
        databaseConnectionPool.query(getUserIdQuery, (err, result) => {
            if (err)
            {
                reject(`Get User Id Error: ${err}`);
                return;
            }

            if (result.length === 0)
            {
                resolve(null);
                return;
            }

            resolve(result[0].userID);
        });

    });

    return promise;
}

/**
 * Get the hashed and salted password from the database for the passed in username.
 * 
 * @param {string} username The username of the user you want the password for.
 * @returns The hashed and salted password for the requested username.
 */
async function getUserPassword(username)
{
    const promise = new Promise((resolve, reject) => {
        const queryString =
        `
            SELECT password
            FROM Users
            WHERE username = '${username}';
        `;

        databaseConnectionPool.query(queryString, (err, result) => {
            if (err)
            {
                reject(`Get User Password Error: ${err}`);
                return;
            }

            if (result.length === 0)
            {
                resolve(null);
                return;
            }
    
            resolve(result[0].password);
        });
    });

    return promise;
}

/**
 * Insert a new user session into the database. That is, the database is our session store.
 * 
 * @param {string} sessionID The session ID string.
 * @param {string} username The username associated with the session ID.
 * @returns The result object containing information on if the database query was successful or not.
 */
async function insertNewUserSession(sessionID, username)
{
    const userID = await getUserID(username);
    const expirationDate = new Date(Date.now() + helpers.daysToMilliseconds(config.SESSION_DAYS_UNTIL_EXPIRE));
    let [ utcDate, utcTime ] = expirationDate.toISOString().split("T");
    utcTime = utcTime.substring(0, utcTime.lastIndexOf(":") + 3);

    const insertQuery =
    `
        INSERT INTO Sessions (sessionID, userID, expires)
        VALUES ('${sessionID}', ${userID}, '${utcDate + ' ' + utcTime}');
    `;

    const promise = new Promise((resolve, reject) => {
        databaseConnectionPool.query(insertQuery, (err, result) => {
            if (err)
            {
                reject(`Database Insert Session Error: ${err}`);
                return;
            }

            resolve(result);
        });
    });

    return promise;
}

/**
 * Get the user that is asscoated with the passed in session ID.
 * 
 * @param {string} sessionID A session ID string.
 * @returns The username associated with the session ID.
 */
async function getUserFromSession(sessionID)
{
    // Makes sure we only get users associated with sessions that are
    // NOT expired.
    const queryString =
    `
        SELECT Users.username
        FROM Users
        JOIN Sessions
            ON Users.userID = Sessions.userID
        WHERE Sessions.sessionID = '${sessionID}'
            AND Sessions.expires > UTC_TIMESTAMP();
    `;

    const promise = new Promise((resolve, reject) => {
        databaseConnectionPool.query(queryString, (err, result) => {
            if (err)
            {
                reject(`Database Get User From Session Error: ${err}`);
                return;
            }

            if (result.length === 0)
            {
                resolve(null);
                return;
            }
    
            resolve(result[0].username);
        });
    });

    return promise;

}
/**
 * Remove the session from the database assocaited with the passed in sessionID.
 * 
 * @param {string} sessionID A session ID string.
 * @returns The result object containing information on if the database query was successful or not.
 */
async function removeUserSession(sessionID)
{
    const queryString =
    `
        DELETE FROM Sessions
        WHERE sessionID = '${sessionID}';
    `;

    const promise = new Promise((resolve, reject) => {
        databaseConnectionPool.query(queryString, (err, result) => {
            if (err)
            {
                reject(`Database Remove Session Error: ${err}`);
                return;
            }

            resolve(result);
        });
    });

    return promise;
}

module.exports = {
    userExists: userExists,
    insertNewUser: insertNewUser,
    getUserPassword: getUserPassword,
    insertNewUserSession: insertNewUserSession,
    getUserFromSession: getUserFromSession,
    removeUserSession: removeUserSession
}