"use strict";

const http = require("http");

const config = require("./config/config");
const helpers = require("./helpers/helpers");
const db = require("./config/db");
const validators = require("./helpers/validators");
const cookies = require("./helpers/cookies");
const sessions = require("./helpers/sessions");
const { User } = require("./models/User");



async function handleGetRequests(req, res)
{
    const requestURL = new URL(req.url, `http://${req.headers.host}`);
    const pathname = requestURL.pathname;
    const username = await sessions.hasValidSession(req);

    if (pathname === "/")
    {
        const indexHTML = await helpers.readFileV2("./views/index.html");

        if (username !== false)
        {
            // TODO: Return dynamic content instead
            res.writeHead(200, {"Content-Type": "text/html"});
            res.write(indexHTML);
        }
        else
        {
            res.writeHead(200, {"Content-Type": "text/html"});
            res.write(indexHTML);
        }
    }
    else if (pathname === "/login")
    {
        const loginHTML = await helpers.readFileV2("./views/login.html");
        res.writeHead(200, {"Content-Type": "text/html"});
        res.write(loginHTML);
    }
    else if (pathname === "/register")
    {
        const registerHTML = await helpers.readFileV2("./views/register.html");
        res.writeHead(200, {"Content-Type": "text/html"});
        res.write(registerHTML);
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

    if (pathname === "/register")
    {
        const formDataMap = await helpers.parseRequestData(req);
        const { username, password } = Object.fromEntries(formDataMap);
        const hashedPasswordAndSalt = await validators.saltAndHashPassword(password);

        if (!validators.validateUsername(username))
        {
            res.writeHead(200, {"Content-Type": "text/html"});
            res.write("Invalid Username.");
        }
        else if (!validators.validatePassword(password))
        {
            res.writeHead(200, {"Content-Type": "text/html"});
            res.write("Invalid Password.");
        }
        else
        {
            try
            {
                await db.insertNewUser(username, hashedPasswordAndSalt);
                res.writeHead(200, {"Content-Type": "text/html"});
                res.write("<h1>Registration Completed Successfully!</h1>");
            }
            catch(err)
            {
                res.writeHead(200, {"Content-Type": "text/html"});
                res.write(`<h1>Error: ${err.message}</h1>`);
            }
                
        }
        
    }
    else if (pathname === "/login")
    {
        const formDataMap = await helpers.parseRequestData(req);
        const { username, password } = Object.fromEntries(formDataMap);

        if (await db.userExists(username))
        {
            const userHashedAndSaltedPassword = await db.getUserPassword(username);

            if (await validators.authenticatePassword(userHashedAndSaltedPassword, password))
            {
                await sessions.createNewSessionForUser(res, username);
                res.writeHead(200, {"Content-Type": "text/html"});
                res.write("<h1>Login Successful!</h1>");
            }
            else
            {
                res.writeHead(200, {"Content-Type": "text/html"});
                res.write("<h1>Wrong password!</h1>");
            }
        }
        else
        {
            res.writeHead(200, {"Content-Type": "text/html"});
            res.write("<h1>User does not exist!</h1>");
        }
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

server.listen(config.WEB_SERVER_PORT, () => {
    const { address, port } = server.address();
    console.log(`Web server is listening at ${address}:${port}...`);
});