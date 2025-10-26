// Routes for author-side
module.exports = function(app) {
    // Import Joi for data validation
    const Joi = require('joi');
    // Import the format function from date-fns for date formatting
    const { format } = require("date-fns");


    // Define a route for creating a new draft
    app.get("/draft", function(req, res){
        // Check if the user is an author
        if(!req.session.userInfo === 'author'){
            // If the user is not an author, redirect them to the author's home page
            res.redirect("/author/home");
        }
        // SQL query to insert a new article with the current date and time into the articles table
        let insertion = `INSERT INTO articles (created) VALUES ('${format(new Date(Date.now()), 'yyyy-MM-dd HH:mm:ss')}');`;
        // Execute the SQL query
        global.db.get(insertion, (err, result) => { 
            // If there's an error, log it
            if (err) { 
                console.log(err); 
            }
            else{
                // SQL query to get the most recently created article
                let retrieval = "SELECT * FROM articles ORDER BY id DESC LIMIT 1";

                // Execute the SQL query
                global.db.get(retrieval, (err, result) => { 
                    // If there's an error, log it
                    if (err) { 
                        console.log(err); 
                    }
                    else{
                        // Redirect the user to the edit page for the new article
                        res.redirect(`/author/article/${result.id}`)
                    }
                });
            }
        });
    });


    // Define a route for deleting an article
    app.get("/delete/:id", function(req, res){
        // Check if the user is an author
        if(!req.session.userInfo === 'author'){
            // If the user is not an author, redirect them to the author's home page
            res.redirect("/author/home");
        }

        // SQL query to delete the article with the specified id from the articles table
        let deletion = `DELETE FROM articles WHERE id=${req.params.id};`;

        // Execute the SQL query
        global.db.get(deletion, (err, result) => { 
            // If there's an error, log it
            if (err) { 
                console.log(err); 
            }
            else{
                // Redirect the user to the author's home page
                res.redirect("/author/home");
            }
        });
    });


    // Define a route for publishing an article
    app.get("/publish/:id", function(req, res){
        // Check if the user is an author
        if(!req.session.userInfo === 'author'){
            // If the user is not an author, redirect them to the author's home page
            res.redirect("/author/home");
        }

        // SQL query to update the article with the specified id, setting its published status to 1 and its published_time to the current date and time
        let publish = `UPDATE articles SET published = 1, published_time ='${format(new Date(Date.now()), 'yyyy-MM-dd HH:mm:ss')}' WHERE id=${req.params.id}`;

        // Execute the SQL query
        global.db.get(publish, (err, result) => { 
            // If there's an error, log it
            if (err) { 
                console.log(err); 
            }
            // If the update is successful
            else{
                // SQL query to insert a new row into the views table with the article_id set to the id of the published article
                let query = `INSERT INTO views (article_id) VALUES (${req.params.id});`;
                // Execute the SQL query
                global.db.get(query, (error, _) => {
                    // If there's an error, log it
                    if(error){
                        console.log(error);
                    }
                })
                // SQL query to insert a new row into the likes table with the article_id set to the id of the published article
                query = `INSERT INTO likes (article_id) VALUES (${req.params.id});`;
                // Execute the SQL query
                global.db.get(query, (error, _) => {
                    // If there's an error, log it
                    if(error){
                        console.log(error);
                    }
                })
                res.redirect("/author/home");
            }
        });
    });

    // Define a route for editing an article
    app.get("/author/article/:id", function(req, res){
        // Check if the user is an author
        if(!req.session.userInfo === 'author'){
            // If the user is not an author, redirect them to the author's home page
            res.redirect("/author/home");
        }
        // SQL query to get the article with the specified id from the articles table
        let query = `SELECT * FROM articles WHERE id=${req.params.id}`;
         // Execute the SQL query
        global.db.get(query, (err, result) => {
            // If there's an error, log it 
            if (err) { 
                console.log(err); 
            }
            else{
                // Render the author_edit.ejs page with the article data and no error message
                res.render("author_edit.ejs", {
                    title: "Author - Edit Article Page",
                    article: result,
                    error: undefined
                });
            }
        });
    });
    
    // Define a route for the author settings page
    app.get("/author/settings", function(req, res){
        // Check if the user is an author
        if(!req.session.userInfo === 'author'){
            // If the user is not an author, redirect them to the author's home page
            res.redirect("/author/home");
        }
        else{
            // SQL query to get all blog and author details
            let query = "SELECT * FROM blog INNER JOIN author ON blog.author_id = author.id";
            // Execute the SQL query
            global.db.get(query, (err, result) => { 
                // If there's an error, log it
                if (err) { 
                    console.log(err); 
                }
                else{
                    // Render the author_settings.ejs page with the blog and author data and no error message
                    res.render("author_settings.ejs", {
                        title: "Settings",
                        blogtitle: result.title,
                        blogsubtitle: result.subtitle,
                        author_first: result.firstname,
                        author_last: result.lastname,
                        error: undefined
                    });
                }
            });
        } 
    });


    // Define a route for the author home page
    app.get("/author/home", function(req, res) {                   
        // SQL query to get the count of authors
        let query = "SELECT COUNT(*) FROM author";                 

        // Execute the SQL query
        global.db.get(query, (err, result) => {
            if (err) { 
                // If there's an error, log it
                console.log(err); 
            }
            else if (result['COUNT(*)'] == 0){                    
                // If there are no authors, render the registration page for the first author
                res.render("register.ejs", {
                    title: "Be the author!",
                    desc: "Become the author of this site. Register now!",
                    register_type: "author/register",
                    error: undefined
                });
            }
            else if(req.session.userInfo == null || req.session.userInfo === 'reader'){       
                // If the user is not logged in or is a reader, render the author login page
                res.render("login.ejs", {
                    title: "Author Login",
                    desc: "Login as author to write/edit/publish new articles.",
                    login_type: "author/login",
                    error: undefined
                });
            }
            // If the user is an author
            else {
                // SQL query to get all blog posts written by the author
                let blog_info = "SELECT * FROM blog INNER JOIN author ON blog.author_id = author.id";       

                // Execute the SQL query
                global.db.get(blog_info, (err, result) => { 
                    // If there's an error, log it
                    if (err) { 
                        console.log(err); 
                    }
                    else {
                        // SQL query to get all articles
                        let articles_query = "SELECT * FROM articles;";

                        // Execute the SQL query
                        global.db.all(articles_query, (err, _articles) => {
                            // If there's an error, log it
                            if(err){
                                console.log(err);
                            }
                            else {
                                // Render the author_homepage.ejs page with the blog, author, and articles data
                                res.render("author_homepage.ejs", {
                                    title: "Author - Home Page",
                                    blogtitle: result.title,
                                    blogsubtitle: result.subtitle,
                                    author_first: result.firstname,
                                    author_last: result.lastname,
                                    articles: _articles
                                });
                            }
                        });
                    }
                });
            }
        });
    });
    // Define a route for author logout
    app.get('/author/logout', function(req, res){           
        // Check if the user is not an author
        if(!req.session.userInfo === 'author'){
            // If the user is not an author, redirect them to the author's home page
            res.redirect("/author/home");
        }
        // Destroy the session
        req.session.destroy(); 
        // Redirect to the home page
        res.redirect('/');
    })
    app.post("/author/register", function (req,res) {                  // Author register page for Case: No author in route /author/home
        // Define a Joi schema for validation
        const register_validator = Joi.object({
            username: Joi.string().alphanum().min(3).max(20).required(),
            pass: Joi.string().regex(/^(?=.*[A-Z])(?=.*\d).{8,}$/).required().messages({
                'string.pattern.base': 'Password must contain at least 1 uppercase letter and 1 number',
            }),
            firstname: Joi.string().max(20).required(),
            lastname: Joi.string().max(20).required(),
            email: Joi.string().email().required(),
            blogtitle: Joi.string().max(20).required(),
            blogsubtitle: Joi.string().max(20).allow(null, '')
        });

        // Validate the request body against the Joi schema
        const { error, value } = register_validator.validate(req.body);

        // If there's an error in validation
        if(error){
            // Log the error
            console.log(error)
            // Render the registration page with the error details
            res.render("register.ejs", {
                title: "Be the author!",
                desc: "Become the author of this site. Register now!",
                register_type: "author/register",
                error: error.details
            });
        }
        // If validation is successful
        else{
            // SQL query to insert the new author into the database
            let query = `INSERT INTO author (username, pass, firstname, lastname, email) VALUES              
            ('${value.username}', '${value.pass}', '${value.firstname}', '${value.lastname}', '${value.email}');`;    

            // Execute the SQL query
            global.db.run(query, (err, result) => { 
                // If there's an error, log it
                if (err) { 
                    console.log(err); 
                }
            });
            // Set a secure cookie with the author's email
            res.cookie('email', value['email'], {secure: true});
            // Set the user's session info to 'author'
            req.session.userInfo = 'author';

            // SQL query to insert the new blog into the database
            query = `INSERT INTO blog (title, subtitle, author_id) VALUES ('${value.blogtitle}', '${value.blogsubtitle}', 1);`;     

            // Execute the SQL query
            global.db.run(query, (err, result) => { 
                // If there's an error, log it
                if (err) { 
                    console.log(err); 
                } 
                else {
                    // If the blog is successfully inserted, redirect to the author's home page
                    res.redirect('/author/home')
                }
            });
        }
    });


    // Define a route for author login
    app.post("/author/login", async function (req,res) {              
        // SQL query to get the email and password of the first author
        let query = 'SELECT email, pass FROM author LIMIT 1;';

        // Execute the SQL query
        global.db.get(query, (err, result) => {
            // If there's an error, log it
            if (err) { 
                console.log(err); 
            } 
            var author_email = result['email'];
            var author_pass = result['pass'];
            const{ email, pass } = req.body;
            // If the email and password match the ones in the database
            if(email == author_email && pass == author_pass){
             // Set a secure cookie with the author's email
                res.cookie('email', author_email, {secure: true});
                // Set the user's session info to 'author'
                req.session.userInfo = 'author';
                // Redirect to the author's home page
                res.redirect("/author/home");
            }
            // If the email and password do not match
            else{
                // Render the login page with an error message
                res.render("login.ejs", {
                    title: "Author Login",
                    desc: "Login as author to write/edit/publish new articles.",
                    login_type: "author/login",
                    error: "Invalid email or password"
                });
            }
        });
    });


    // Define a route for updating the blog details
    app.post("/author/blog_update", function (req,res) {          
        // Define a Joi schema for validation
        const blogUpdateValidator = Joi.object({
            blogtitle: Joi.string().required(),
            blogsubtitle: Joi.string().optional(),
            author_first: Joi.string().required(),
            author_last: Joi.string().required(),
        });

        // Validate the request body against the Joi schema
        const {error, value} = blogUpdateValidator.validate(req.body);

        // If there's an error in validation
        if (error) {
            // Log the error
            console.error(error.details[0].message);
            // Redirect to the author's settings page
            res.redirect('/author/settings');
        }
        else{
            // SQL query to update the blog details in the database
            let query = `UPDATE blog SET title = '${value.blogtitle}', subtitle = '${value.blogsubtitle}'`;      

            // Execute the SQL query
            global.db.run(query, (err, result) => { 
                // If there's an error, log it
                if (err) { 
                    console.log(err); 
                }
            });

            // SQL query to update the author details in the database
            query = `UPDATE author SET firstname = '${value.author_first}', lastname = '${value.author_last}'`;   

            // Execute the SQL query
            global.db.run(query, (err, result) => { 
                // If there's an error, log it
                if (err) { 
                    console.log(err); 
                }
            });
            // Redirect to the author's home page
            res.redirect('/author/home')
        }
    });


    // Define a route for updating the article details
    app.post("/author/article_update", function(req, res){                           
        // Define a Joi schema for validation
        const articleUpdateValidator = Joi.object({
            article_id: Joi.string().required(),
            article_title: Joi.string().min(3).max(30).required(),
            article_subtitle: Joi.string().min(3).optional().allow('', null),
            article_body: Joi.string().min(10).max(300).required()
        });

        // Validate the request body against the Joi schema
        const {error, value} = articleUpdateValidator.validate(req.body);

        // If there's an error in validation
        if (error) {
            // Log the error
            console.error(error.details[0].message);
            // Redirect to the author's settings page
            res.redirect('/author/settings');
        }
        // If validation is successful
        else{
            // SQL query to update the article details in the database
            let query = `UPDATE article SET title = '${value.article_title}', subtitle = '${value.article_subtitle}', body = '${value.article_body}' WHERE id = '${value.article_id}'`;      

            // Execute the SQL query
            global.db.run(query, (err, result) => { 
                // If there's an error, log it
                if (err) { 
                    console.log(err); 
                }
                else{
                    res.redirect(`/author/article/${value.article_id}`)
                }
            });
        }
    });
    
}