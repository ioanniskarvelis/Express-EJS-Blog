/**
* index.js
* This is your main app entry point
*/

// Import the express module
require('dotenv').config();
const express = require('express');
// Create an instance of express
const app = express();
// Define the port where the server will listen
const port = process.env.PORT || 3000;

// Import the body-parser module
var bodyParser = require("body-parser");
// Use body-parser to parse the body of incoming requests
app.use(bodyParser.urlencoded({ extended: true }));

// Set the views directory
app.set("views",__dirname + "/views"); 
// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set the directory for static files
app.use(express.static(__dirname + '/public'));

// Import the sqlite3 module
const sqlite3 = require('sqlite3').verbose();
// Create a new SQLite database connection
const databaseFile = process.env.DATABASE_FILE || './database.db';
global.db = new sqlite3.Database(databaseFile,function(err){
    // If there's an error connecting to the database
    if(err){
        // Log the error
        console.error(err);
        // Exit the process
        process.exit(1);
    } 
    // If the connection is successful
    else {
        // Log a success message
        console.log("Database connected");
        // Enable foreign key constraints in SQLite
        global.db.run("PRAGMA foreign_keys=ON");
    }
})

// Import the express-session module
const expressSession = require('express-session');
const SQLiteStore = require('connect-sqlite3')(expressSession);

// Create a session middleware with the given options
const session = expressSession({
    secret: process.env.SESSION_SECRET || 'change-me',
    store: new SQLiteStore({ db: 'sessions.sqlite', dir: './' }),
    resave: false,
    saveUninitialized: true,
    cookie: {
        sameSite: 'strict',
        secure: String(process.env.COOKIE_SECURE).toLowerCase() === 'true'
    }
});

// Use the session middleware
app.use(session);

// Add all the route handlers to the main pages
require("./routes/main")(app);

// Add all the route handlers to the author pages
require("./routes/author")(app);

// Add all the route handlers to the reader pages
require("./routes/reader")(app);


// Make the web application listen for HTTP requests
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

