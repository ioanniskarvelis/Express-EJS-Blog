// Export a function that takes an Express application as an argument
module.exports = function(app) {
    // Import Joi for data validation
    const Joi = require('joi');
    // Import the format function from date-fns for date formatting
    const { format } = require("date-fns");

    // Define a route for the reader's home page
    app.get('/reader/home', function(req, res){
        // SQL query to get blog and author information by joining the blog and author tables
        let blog_info = "SELECT * FROM blog INNER JOIN author ON blog.author_id = author.id";
        // Execute the SQL query
        global.db.get(blog_info, (err, result) => { 
            // If there's an error, log it
            if (err) { 
                console.log(err); 
            }
            else{
                // SQL query to get all published articles, ordered by publication time
                articles_query = "SELECT * FROM articles WHERE published=TRUE ORDER BY published_time DESC;";
                global.db.all(articles_query, (err, _articles) => {
                    // Execute the SQL query
                    if(err){
                        console.log(err);
                    }
                    else{
                        // Render the reader's home page with the blog and article information
                        res.render("reader_homepage.ejs", {
                            title: "Reader - Home Page",
                            blogtitle: result.title,
                            blogsubtitle: result.subtitle,
                            author_first: result.firstname,
                            author_last: result.lastname,
                            articles: _articles,
                            // Pass the user's session information to the template
                            authorized: req.session.userInfo
                        });
                    }
                });
            }
        });
    });

    // Define a route for the login page
    app.get('/login', function(req, res){
        // Render the login page using the "login.ejs" template
        res.render("login.ejs", {
            // Set the title of the page to "Reader Login"
            title: "Reader Login",
            // Set the description of the page
            desc: "Login as reader to like and comment in articles.",
            // Set the login type to "reader/login"
            login_type: "reader/login",
            // Initialize the error message to undefined
            error: undefined
        });
    });

    // Define a route for the registration page
    app.get('/register', function(req, res){
        // Render the registration page using the "register.ejs" template
        res.render("register.ejs", {
            // Set the title of the page to "Reader Register"
            title: "Reader Register",
            // Set the description of the page
            desc: "Join the audience. Register now!",
            // Set the registration type to "reader/register"
            register_type: "reader/register",
            // Initialize the error message to undefined
            error: undefined
        });
    });

    // Define a route for viewing a specific article by its ID
    app.get("/reader/article/:id", function(req, res){
        // SQL query to get the article information by its ID
        let query = `SELECT * FROM articles WHERE id=${req.params.id} and published=TRUE;`;
        // Execute the SQL query
        global.db.get(query, (error, _article) => {
            // If there's an error, log it
            if (error) { 
                console.log(error); 
            }
            else{
                // SQL query to get the comments for the article by its ID
                let comments_query = `SELECT * FROM comments WHERE article_id=${req.params.id} ORDER BY commented_time DESC;`;
                // Execute the SQL query
                global.db.all(comments_query, (err, _comments) => {
                    // If there's an error, log it
                    if (err) { 
                        console.log(err); 
                    }
                    else{
                        // SQL query to update the view counter for the article by its ID
                        let views_update = `UPDATE views SET view_counter = view_counter + 1 WHERE article_id=${req.params.id};`;
                        // Execute the SQL query
                        global.db.run(views_update, (err, _) => {
                            // If there's an error, log it
                            if(err){
                                console.log();
                            }
                        });
                        // SQL query to get the view and like counters for the article by its ID
                        let stats_query = `SELECT view_counter, like_counter FROM views INNER JOIN likes ON views.article_id = likes.article_id WHERE views.article_id=${req.params.id};`;
                        // Execute the SQL query
                        global.db.get(stats_query, (_err, _stats) => {
                            // If there's an error, log it
                            if(_err){
                                console.log(_err);
                            }
                            // Render the reader's article page with the article, comments, and stats information
                            else{
                                res.render("reader_view.ejs", {
                                    title: "Reader - Article Page",
                                    article: _article,
                                    comments: _comments,
                                    stats: _stats,
                                    authorized: req.session.userInfo
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    // Define a route for posting a new comment
    app.post('/newcomment', function(req, res){
        // Define a validation schema for the comment
        const comment_validator = Joi.object({
            name: Joi.string().min(3).max(20).required(),
            comment: Joi.string().max(100).required(),
            article_id: Joi.number().required()
        });
        // Validate the request body against the Joi schema
        const { error, value } = comment_validator.validate(req.body);
        
        // If there's an error, log it
        if(error){
            console.log(error)
        }
        else{
            // SQL query to insert the comment into the database
            let query = `INSERT INTO comments (article_id, commenter, body, commented_time) VALUES 
            (${value.article_id}, '${value.name}', '${value.comment}', '${format(new Date(Date.now()), 'yyyy-MM-dd HH:mm:ss')}');`;
            // Execute the SQL query
            global.db.run(query, (err, result) => {
                // If there's an error, log it
                if (err) { 
                    console.log(err); 
                }
                else{
                    // Redirect the user back to the article page
                    res.redirect(`/reader/article/${value.article_id}`)
                }
            });
        }

    });

    // Define a route for liking an article
    app.get('/like/:id', function(req, res){
        // SQL query to update the like counter for the article by its ID
        let query = `UPDATE likes SET like_counter = like_counter + 1 WHERE article_id=${req.params.id};`;
        // Execute the SQL query
        global.db.run(query, (error, _) => {
            // If there's an error, log it
            if(error){
                console.log(error);
            }
            else{
                // Redirect the user back to the article page
                res.redirect(`/reader/article/${req.params.id}`);
            }
        });
    });

    // Define a route for reader login
    app.post('/reader/login', function(req, res){
        // SQL query to get the reader information by their email and password
        let query = `SELECT * FROM readers WHERE email='${req.body.email}'AND pass='${req.body.pass}' LIMIT 1;`
        // Execute the SQL query
        global.db.get(query, (err, result) => {
            // If there's an error, log it
            if (err) { 
                console.log(err); 
            } 

            // Extract the email and password from the result
            var reader_email = result['email'];
            var reader_pass = result['pass'];
            
            // Extract the email and password from the request body
            const{ email, pass } = req.body;

             // If the email and password match the ones in the database
            if(email == reader_email && pass == reader_pass){
                // Set the reader's session information
                res.cookie('email', reader_email, {secure: true});
                req.session.userInfo = 'reader';
                // Redirect the user to the reader's home page
                res.redirect("/reader/home");
            }
            else{
                // Render the login page with an error message
                res.render("login.ejs", {
                    title: "Reader Login",
                    desc: "Login as reader to like and comment in articles.",
                    login_type: "reader/login",
                    error: "Wrong reader credentials!"
                });
            }
        });
    });

    // Define a route for reader registration
    app.post('/reader/register', function(req, res){
        // Define a validation schema for the registration form
        const register_validator = Joi.object({
            username: Joi.string().alphanum().min(3).max(20).required(),
            pass: Joi.string().regex(/^(?=.*[A-Z])(?=.*\d).{8,}$/).required().messages({
                'string.pattern.base': 'Password must contain at least 1 uppercase letter and 1 number',
            }),
            firstname: Joi.string().max(20).required(),
            lastname: Joi.string().max(20).required(),
            email: Joi.string().email().required(),
        });
        // Validate the request body against the Joi schema
        const { error, value } = register_validator.validate(req.body);
        
        if(error){
            // Render the registration page with the error message
            res.render("register.ejs", {
                title: "Reader Register",
                desc: "Join the audience. Register now!",
                register_type: "reader/register",
                error: error.details
            });
        }
        else{
            // SQL query to insert the reader into the database
            let query = `INSERT INTO readers (username, pass, firstname, lastname, email) VALUES 
            ('${value.username}', '${value.pass}', '${value.firstname}', '${value.lastname}', '${value.email}');`;
            // Execute the SQL query
            global.db.run(query, (err, result) => { 
                // If there's an error, log it
                if (err) { 
                    console.log(err); 
                }
                else{
                    // Set the reader's session information
                    res.cookie('email', value['email'], {secure: true});
                    req.session.userInfo = 'reader';
                    res.redirect("/reader/home")
                }
            });
        }
    });

    // Define a route for reader logout
    app.get('/reader/logout', function(req, res){
        // If the user is not logged in
        if(!req.session.userInfo){
            // Redirect the user to the reader's home page
            res.redirect("/reader/home");
        }
        // Destroy the user's session
        req.session.destroy(); 
        // Redirect the user to the main page
        res.redirect('/');
    });
}