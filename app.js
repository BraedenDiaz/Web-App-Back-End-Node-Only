"use strict";

const http = require("http");
const fs = require("fs");
const util = require("util");

const { SERVER_PORT } = require("./config/config");

function readFileV2(file)
{
    return util.promisify(fs.readFile)(file);
}

async function handleGetRequests(req, res)
{
    const requestURL = new URL(req.url, `http://${req.headers.host}`);
    const pathname = requestURL.pathname;

    if (pathname === "/")
    {
        const indexHTML = await readFileV2("./views/index.html");
        res.writeHead(200, {"Content-Type": "text/html"});
        res.write(indexHTML);
        res.end();
    }
    else if (pathname.includes("/public/css/"))
    {
        const cssFile = await readFileV2("./" + pathname);
        res.writeHead(200, {"Content-Type": "text/css"});
        res.write(cssFile);
        res.end();
    }
    else
    {
        res.writeHead(404, {"Content-Type": "text/html"});
        res.write("404 File Not Found.");
        res.end();
    }
}

const server = http.createServer((req, res) => {

    switch (req.method)
    {
        case "GET":
            handleGetRequests(req, res);
            break;
        case "POST":
            res.writeHead(405, {"Content-Type": "text/html"});
            res.write("405 Method Not Allowed.");
            res.end();
            break;
        case "PUT":
            res.writeHead(405, {"Content-Type": "text/html"});
            res.write("405 Method Not Allowed.");
            res.end();
            break;
        case "DELETE":
            res.writeHead(405, {"Content-Type": "text/html"});
            res.write("405 Method Not Allowed.");
            res.end();
            break;
        default:
            res.writeHead(400, {"Content-Type": "text/html"});
            res.write("400 Bad Request.");
            res.end();
    }
});

server.listen(SERVER_PORT, () => {
    const { address, port } = server.address();
    console.log(`Web server is listening at ${address}:${port}...`);
});