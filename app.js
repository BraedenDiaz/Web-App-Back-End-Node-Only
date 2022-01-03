"use strict";

/**
 * @author Braeden Diaz
 * 
 * The main application file that runs and manages all parts of the server, and handles the
 * top-level website routes.
 */

const http = require("http");
const handlebars = require("handlebars");

const config = require("./config/config");
const helpers = require("./helpers/helpers");
const db = require("./config/db");
const validators = require("./helpers/validators");
const cookies = require("./helpers/cookies");
const sessions = require("./helpers/sessions");
const { User } = require("./models/User");

/**
 * A function which handles GET requests for the top-level paths of the website.
 * 
 * @param {http.IncomingMessage} req The HTTP Request Object.
 * @param {http.ServerResponse} res The HTTP Reesponse Object.
 */
async function handleGetRequests(req, res)
{
    const requestURL = new URL(req.url, `http://${req.headers.host}`);
    const pathname = requestURL.pathname;
    const username = await sessions.hasValidSession(req);

    // Send the user the appriate webpage based on the requested path.
    //
    // A dynamic webpage may be sent on certain pages based on whether the user is logged
    // in or not.
    //
    // Other supporting assets such as CSS, client-side JavaScript, etc, is also handled here.
    if (pathname === "/")
    {
        const indexHandlebars = await helpers.readFileV2("./views/index.handlebars");
        const handlebarsTemplate = handlebars.compile(indexHandlebars.toString());

        // Send a dynamic homepage based on whether a user is logged in or not.
        if (username !== false)
        {
            const handlebarsTemplateObj = {
                username: username,
                register: '',
                loginLogout: new handlebars.SafeString('<a href="/logout" class="right">Logout</a>')
            };
        
            const finalHTML = handlebarsTemplate(handlebarsTemplateObj);
            res.writeHead(200, {"Content-Type": "text/html"});
            res.write(finalHTML);
        }
        else
        {
            const handlebarsTemplateObj = {
                username: 'Guest',
                register: new handlebars.SafeString('<a href="/register" class="right">Register</a>'),
                loginLogout: new handlebars.SafeString('<a href="/login" class="right">Login</a>')
            };

            const finalHTML = handlebarsTemplate(handlebarsTemplateObj);
            res.writeHead(200, {"Content-Type": "text/html"});
            res.write(finalHTML);
        }
    }
    else if (pathname === "/login")
    {
        // If a user is already logged in, simply redirect them back to the homepage.
        if (username)
        {
            res.writeHead(302, {"Location": "/"});
        }
        else
        {
            const loginHTML = await helpers.readFileV2("./views/login.html");
            res.writeHead(200, {"Content-Type": "text/html"});
            res.write(loginHTML);
        }
    }
    else if (pathname === "/logout")
    {
        sessions.destroyUserSession(res, cookies.getCookie(req, "sessionID"));
        res.writeHead(302, {"Location": "/"});
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
    else if (pathname.includes("/public/javascript/"))
    {
        const javascriptFile = await helpers.readFileV2("./" + pathname);
        res.writeHead(200, {"Content-Type": "text/javascript"});
        res.write(javascriptFile);
    }
    else
    {
        res.writeHead(404, {"Content-Type": "text/html"});
        res.write("404 File Not Found.");
    }

    res.end();
}

/**
 * A function which handles POST requests for the top-level paths of the website.
 * 
 * @param {http.IncomingMessage} req The HTTP Request Object.
 * @param {http.ServerResponse} res The HTTP Reesponse Object.
 */
async function handlePostRequests(req, res)
{
    const requestURL = new URL(req.url, `http://${req.headers.host}`);
    const pathname = requestURL.pathname;

    // handle the POST request and send the user to the approiate page.
    //
    // A dynamic webpage may be sent on certain pages based on whether the user is logged
    // in or not.
    if (pathname === "/register")
    {
        // Parse the registration data the user has entered
        const formDataMap = await helpers.parseRequestData(req);
        const { username, password } = Object.fromEntries(formDataMap);
        // Obtain a hashed and salted version of the user's password
        const hashedPasswordAndSalt = await validators.saltAndHashPassword(password);

        // Perform various validations on the user's input to make sure it's legal, valid,
        // and not malicious before reaching the "else" branch where we use it.
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
            // Insert the new user into the database.
            try
            {
                await db.insertNewUser(username, hashedPasswordAndSalt);
                res.writeHead(200, {"Content-Type": "text/html"});
                res.write("<h1>Registration Completed Successfully!</h1>");
            }
            catch(err)
            {
                res.writeHead(503, {"Content-Type": "text/html"});
                res.write(`<h1>503 Error: Service Unavailable. Try Again Later.</h1>`);
            }
                
        }
        
    }
    else if (pathname === "/login")
    {
        // Parse the login data the user has entered
        const formDataMap = await helpers.parseRequestData(req);
        const { username, password } = Object.fromEntries(formDataMap);

                // Perform various validations on the user's input to make sure it's legal, valid,
        // and not malicious before reaching the "else" branch where we use it.
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
            // Check if the user exists
            if (await db.userExists(username))
            {
                // Obtain the hashed and salted password for the user from the database
                const userHashedAndSaltedPassword = await db.getUserPassword(username);

                // Authenticate the password from the database with the one entered by the user
                if (await validators.authenticatePassword(userHashedAndSaltedPassword, password))
                {
                    // If the passwor4d was successfully authenticated, create a new session for the
                    // user and redirect them to the homepage.
                    await sessions.createUserSession(res, username);
                    res.writeHead(302, {"Location": "/"});
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
    }
    else
    {
        res.writeHead(405, {"Content-Type": "text/html"});
        res.write("405 Method Not Allowed.");
    }

    res.end();
}

/**
 * Constant that holds the main server instance function.
 * 
 * Once a request is received, the server will direct it to the approriate handler function
 * based on the type of HTTP request.
 */
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

// Start the server listening on the current host and the configured port
server.listen(config.WEB_SERVER_PORT, () => {
    const { address, port } = server.address();
    console.log(`Web server is listening at ${address}:${port}...`);
});