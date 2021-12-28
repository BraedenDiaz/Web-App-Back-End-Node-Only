"use strict";

const mysql = require("mysql2");

const helpers = require("../helpers/helpers");
const config = require("./config");

const databaseConnectionPool = mysql.createPool({
    host: config.MySQL_HOST,
    user: config.MySQL_USER,
    password: config.MySQL_DB_PASSWORD,
    database: config.MySQL_DB_NAME
});

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
            }
    
            return resolve(result.length > 0);
        });
    })

    return promise;

}

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

    databaseConnectionPool.query(queryString, (err, result) => {
        if (err)
        {
            throw new Error(`Database Insert Error: ${err}`);
        }
    });
}

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
            }

            if (result.length === 0)
            {
                resolve(null);
            }

            resolve(result[0].userID);
        });

    });

    return promise;
}

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
            }

            if (result.length === 0)
            {
                resolve(null);
            }
    
            resolve(result[0].password);
        });
    });

    return promise;
}

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

    databaseConnectionPool.query(insertQuery, (err, result) => {
        if (err)
        {
            throw new Error(`Database Insert Session Error: ${err}`);
        }
    });
}

async function getUserFromSession(sessionID)
{
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
            }

            if (result.length === 0)
            {
                resolve(null);
            }
    
            resolve(result[0].username);
        });
    });

    return promise;

}

module.exports = {
    userExists: userExists,
    insertNewUser: insertNewUser,
    getUserPassword: getUserPassword,
    insertNewUserSession: insertNewUserSession,
    getUserFromSession: getUserFromSession
}