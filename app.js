"use strict";

const http = require("http");

const { SERVER_PORT } = require("./config/config");
const helpers = require("./helpers/helpers");


async function handleGetRequests(req, res)
{
    const requestURL = new URL(req.url, `http://${req.headers.host}`);
    const pathname = requestURL.pathname;

    if (pathname === "/")
    {
        const indexHTML = await helpers.readFileV2("./views/index.html");
        res.writeHead(200, {"Content-Type": "text/html"});
        res.write(indexHTML);
    }
    else if (pathname === "/signin")
    {
        const signinHTML = await helpers.readFileV2("./views/signin.html");
        res.writeHead(200, {"Content-Type": "text/html"});
        res.write(signinHTML);
    }
    else if (pathname.includes("/public/css/"))
    {
        const cssFile = await helpers.readFileV2("./" + pathname);
        res.writeHead(200, {"Content-Type": "text/css"});
        res.write(cssFile);
    }
    else
    {
        res.writeHead(404, {"Content-Type": "text/html"});
        res.write("404 File Not Found.");
    }

    res.end();
}

async function handlePostRequests(req, res)
{
    const requestURL = new URL(req.url, `http://${req.headers.host}`);
    const pathname = requestURL.pathname;

    if (pathname === "/signin")
    {
        // Short way of handling a Promise
        const formDataMap = await helpers.parseRequestDataV2(req);
        console.log("Finished Reading Data:");
        console.log(formDataMap);
        res.writeHead(200, {"Content-Type": "text/html"});


        // Old way using a callback
        // helpers.parseRequestData(req, (error, value) => {
        //     if (error)
        //     {
        //         console.log(error);
        //     }

        //     console.log(value.get("usernameTextBox"));
        //     res.writeHead(200, {"Content-Type": "text/html"});
        // });


        // Long way of handling a promise
        // helpers.parseRequestDataV2(req)
        // .then(value => {
        //     console.log("Passed");
        //     console.log(value);
        //     res.writeHead(200, {"Content-Type": "text/html"});
        // })
        // .catch(error => {
        //     console.log(error);
        //     res.writeHead(200, {"Content-Type": "text/html"});
        // })
    }
    else
    {
        res.writeHead(405, {"Content-Type": "text/html"});
        res.write("405 Method Not Allowed.");
    }

    res.end();
}

const server = http.createServer((req, res) => {

    switch (req.method)
    {
        case "GET":
            handleGetRequests(req, res);
            break;
        case "POST":
            handlePostRequests(req, res);
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