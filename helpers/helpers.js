"use strict";

const { readFile } = require("fs");
const { promisify } = require("util");
const { URLSearchParams } = require("url");

function readFileV2(file)
{
    return promisify(readFile)(file);
}

// Old way using a callback
function parseRequestData(req, callback)
{
    let requestBodyData = "";

    req.on("data", chunk => {
        requestBodyData += chunk;

        // If we receive too much POST data, kill the connection!
        // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~ 1MB
        if (requestBodyData.length > 1e6)
        {
            req.connection.destroy();
            callback("Error: Too much POST data reveived!", null);
        }
    });

    req.on("end", () => {
        callback(null, new URLSearchParams(requestBodyData));
    });
}

// New way using a Promise
function parseRequestDataV2(req)
{
    const promise = new Promise((resolve, reject) => {
        let requestBodyData = "";

        req.on("data", chunk => {
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
            resolve(new URLSearchParams(requestBodyData));
        });
    });

    return promise;

}

module.exports.parseRequestData = parseRequestData;
module.exports.readFileV2 = readFileV2;
module.exports.parseRequestDataV2 = parseRequestDataV2;