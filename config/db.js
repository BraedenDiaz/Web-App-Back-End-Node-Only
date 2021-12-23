"use strict";

const mysql = require("mysql2");
const config = require("./config");

const databaseConnectionPool = mysql.createPool({
    host: config.MySQL_HOST,
    user: config.MySQL_USER,
    password: config.MySQL_DB_PASSWORD,
    database: config.MySQL_DB_NAME
});


function showDatabases()
{
    databaseConnectionPool.query("SHOW DATABASES;", (err, result) => {
        if (err)
        {
            throw new Error(`Show Databases Error: ${err}`);
        }

        console.log("Databases:");
        console.log(result);
    });
}

function userExists(username)
{
    const queryString = `SELECT username FROM users WHERE username='${username}';`;

    const promise = new Promise((resolve, reject) => {
        databaseConnectionPool.query(queryString, (err, result) => {
            if (err)
            {
                reject(`Database User Exists Query Error: ${err}`);
            }
    
            console.log("\nUser Exists Result");
            console.log(result);
    
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
    })
}

module.exports = {
    showDatabases: showDatabases,
    insertNewUser: insertNewUser
}