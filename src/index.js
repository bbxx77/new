const express = require("express");
const path = require("path");
const collection = require("./config");
const axios = require("axios");
const bodyParser = require("body-parser");
const session = require("express-session");
const app = express();
const port = 3000;
const bcrypt = require('bcrypt');
const router = express.Router();

app.use('/api', router);
app.use(session({ secret: "your-secret-key", resave: true, saveUninitialized: true }));
app.use(express.static(__dirname + '../public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use('/api', express.static(path.join(__dirname, 'api')));
app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('public/uploads'));
let existingHtml = "";

app.get("/", (req, res) => {
    res.render("login");
});
app.get("/api/books_by_title", (req, res) => {
    res.render("../api/books_by_title", { existingHtml: existingHtml });
});
app.get("/api/books_by_title", (req, res) => {
    res.render("../api/books_by_title", { existingHtml: existingHtml });
});

app.get("/api/books_by_author", (req, res) => {
    res.render("../api/books_by_author", { authorsData: existingHtml });
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/home", (req, res) => {
    res.render("../views/home");
});


app.get("/rest-api", (req, res) => {
    res.render("../rest-api/admin-rest-api");
});

app.get('/search-author', (req, res) => {
    res.render('../api/search_author');
});


app.post("/signup", async (req, res) => {
    const data = {
        name: req.body.username,
        password: req.body.password
    };

    try {
        const existingUser = await collection.UserModel.findOne({ name: data.name });

        if (existingUser) {
            res.send('User already exists. Please choose a different username.');
        } else {
            const hashedPassword = await bcrypt.hash(data.password, 10);
            data.password = hashedPassword;

            await collection.UserModel.create(data);
            res.send('User registered successfully. Now please Login and you can use the website');
        }
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).send('An error occurred during signup.');
    }
});

app.post("/login", async (req, res) => {
    try {
        const user = await collection.UserModel.findOne({ name: req.body.username });

        if (!user) {
            res.send("User name not found");
        } else {
            const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

            if (isPasswordValid) {
                req.session.userName = user.name;

                if (req.body.username === 'balzhan' && req.body.password === '2003') {
                    res.redirect('/admin-panel');
                } else {
                    res.render("home");
                }
            } else {
                res.send("Incorrect password");
            }
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('An error occurred during login.');
    }
});

app.get("/history", async (req, res) => {
    try {
        const userName = req.session.userName;
        const userHistory = await collection.UserActionModel.find({ username: userName }).sort({ date: -1 });
        res.render("history", { userHistory });
    } catch (error) {
        console.error('Error fetching user history:', error);
        res.status(500).send('An error occurred while fetching user history.');
    }
});

app.get('/admin-panel', async (req, res) => {
    try {
        // Retrieve all users from the database
        const users = await collection.UserModel.find();

        res.render('admin-panel', { users });
    } catch (error) {
        console.error('Error fetching users for admin panel:', error);
        res.status(500).send('An error occurred while fetching users for admin panel.');
    }
});

// Route to handle user deletion in admin panel
app.post('/admin-panel/delete-user/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        // Delete user by ID
        await collection.UserModel.findByIdAndDelete(userId);

        // Redirect back to the admin panel after deletion
        res.redirect('/admin-panel');
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('An error occurred while deleting the user.');
    }
});


app.get('/admin-panel/edit-user/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await collection.UserModel.findById(userId);
        res.render('admin-edit-user', { user });
    } catch (error) {
        console.error('Error fetching user details for edit:', error);
        res.status(500).send('An error occurred while fetching user details for edit.');
    }
});


app.post('/admin-panel/update-user/:userId', async (req, res) => {
    const userId = req.params.userId;
    const updatedUsername = req.body.username;
    const newPassword = req.body.password;

    try {
        const user = await collection.UserModel.findById(userId);

        if (!user) {
            return res.status(404).send('User not found.');
        }
        user.name = updatedUsername;
        await user.save();

        res.redirect('/admin-panel'); 
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('An error occurred while updating the user.');
    }
});



app.post("/search", async (req, res) => {
    const title = req.body.title;
    const apiUrl = `http://openlibrary.org/search.json?title=${title}`;

    try {
        const response = await axios.get(apiUrl);
        const booksData = response.data.docs;

        // Extract necessary information
        const bookInfo = booksData[0];
        const additionalContent = {
            title: bookInfo.title,
            author: bookInfo.author_name ? bookInfo.author_name.join(', ') : '',
            firstPublishYear: bookInfo.first_publish_year || '',
            publishYears: bookInfo.publish_year || [],
        };

        const userName = req.session.userName;

        // Save the result in user action
        const userAction = await collection.UserActionModel.create({
            username: userName,
            action: `Search books for ${title}`,
            date: new Date(),
            result: additionalContent,
        });

        res.render('../api/books_by_title', { existingHtml: additionalContent });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching book data");
    }
});


app.post("/api/books_by_author", async (req, res) => {
    // Handle POST request for author search
    const authorQuery = req.body.author;
    const apiUrl = `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(authorQuery)}`;

    try {
        const response = await axios.get(apiUrl);
        const authorsData = response.data.docs;

        // Render your EJS template with author information
        res.render('../api/books_by_author', { authorsData });
    } catch (error) {
        console.error(error);
        // Render an error page or handle the error in a way that fits your application
        res.render('error_page', { error: "Error fetching author data" });
    }
});



app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
