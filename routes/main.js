// Export a function that takes an Express application as an argument
module.exports = function(app) {
    // Define a route for the home page
    app.get('/', (req, res) => {
        // Reset the user's session info
        req.session.userInfo = null;
        // Set the user's authorization status to false
        req.session.authorized = false;
        // Render the home page with the title "Welcome to our blogsite!"
        res.render("homepage.ejs", {
            title: "Welcome to our blogsite!"
        });
    });
}