"use strict";

const mysql = require("mysql2");
const config = require("./config");

const databaseConnectionPool = mysql.createPool({
    host: config.MySQL_HOST,
    user: config.MySQL_USER,
    password: config.MySQL_DB_PASSWORD,
    database: config.MySQL_DB_NAME
});

async function userExists(username)
{
    const queryString = `SELECT username FROM users WHERE username='${username}';`;

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
    const queryString = `INSERT INTO users (username, password) VALUES ('${username}', '${password}');`;

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

async function getUserPassword(username)
{
    const promise = new Promise((resolve, reject) => {
        const queryString = `SELECT password FROM users WHERE username = '${username}';`;

        databaseConnectionPool.query(queryString, (err, result) => {
            if (err)
            {
                reject(`Get User Password Error: ${err}`);
            }
    
            resolve(result);
        });
    });

    return promise;
}

module.exports = {
    userExists: userExists,
    insertNewUser: insertNewUser,
    getUserPassword: getUserPassword
}