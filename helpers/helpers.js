"use strict";

/**
 * @author Braeden Diaz
 * 
 * Basic helper functions that may be used by multiple parts of the web server. E.g. file reading
 * functions, time conversion functions, etc.
 */

const { readFile } = require("fs");
const { promisify } = require("util");
const { URLSearchParams } = require("url");

/**
 * Simply turns Node's readFile() function into a more modern Promise-based version,
 * uses that to read the passed in file/filepath, and returns the Promise.
 * 
 * @param {string} file 
 * @returns A Promise version of Node's readFile function.
 */
function readFileV2(file)
{
    return promisify(readFile)(file);
}

function daysToMilliseconds(days)
{
    return 1000 * 60 * 60 * 24 * days;
}

function hoursToMilliseconds(hours)
{
    return 1000 * 60 * 60 * hours;
}


// Old way using a callback
// function parseRequestData(req, callback)
// {
//     let requestBodyData = "";

//     req.on("data", chunk => {
//         requestBodyData += chunk;

//         // If we receive too much POST data, kill the connection!
//         // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~ 1MB
//         if (requestBodyData.length > 1e6)
//         {
//             req.connection.destroy();
//             callback("Error: Too much POST data reveived!", null);
//         }
//     });

//     req.on("end", () => {
//         callback(null, new URLSearchParams(requestBodyData));
//     });
// }

// New way using a Promise
/**
 * Parses the body of an HTTP request to obtain form data entered
 * by the client user.
 * 
 * This would usually be done by an existing module/middleware.
 * 
 * @param {http.IncomingMessage} req The HTTP Request Object.
 * @returns A promise which handles the HTTP body parsing.
 */
function parseRequestData(req)
{
    const promise = new Promise((resolve, reject) => {
        let requestBodyData = "";

        // Listen for the "data" event
        req.on("data", chunk => {
            // Append each data chunk to a variable containing all the received data so far.
            requestBodyData += chunk;
    
            // If we receive too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~ 1MB
            if (requestBodyData.length > 1e6)
            {
                req.connection.destroy();
                reject("Error: Too much POST data reveived!");
            }
        });
    
        req.on("end", () => {
            // Resolve with the data passed in a new URLSearchParams instance to help
            // with easy accessing of data.
            resolve(new URLSearchParams(requestBodyData));
        });
    });

    return promise;

}

module.exports = {
    readFileV2: readFileV2,
    daysToMilliseconds: daysToMilliseconds,
    hoursToMilliseconds: hoursToMilliseconds,
    parseRequestData: parseRequestData
};