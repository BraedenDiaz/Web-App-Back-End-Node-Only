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
            throw new Error(`Database Query Error: ${err}`);
        }

        console.log("Databases:");
        console.log(result);
    });
}

module.exports.showDatabases = showDatabases;