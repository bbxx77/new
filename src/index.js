const express = require("express");
const path = require("path");
const collection = require("./config");
const axios = require("axios");
const bodyParser = require("body-parser");
const session = require("express-session");
const app = express();
const port = 5000;
const bcrypt = require('bcrypt');
const router = express.Router();;
const authMiddleware = require('./authMiddleware');
const { isAdmin, isAuthenticated } = require('./authMiddleware');

const multer = require('multer');

app.use('/api', router);
app.use(session({ secret: "your-secret-key", resave: true, saveUninitialized: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('../uploads', express.static('uploads'));



let existingHtml = "";
app.set('views', path.join(__dirname, '../views'));

app.get("/", (req, res) => {
    res.render("login");
});

app.get('/api/books_by_title', authMiddleware.isAuthenticated, (req, res) => {
    res.render("../api/books_by_title", { existingHtml: existingHtml });
});
app.get("/api/books_by_author", authMiddleware.isAuthenticated, (req, res) => {
    res.render("../api/books_by_author", { authorsData: existingHtml });
});
app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get('/search-author', (req, res) => {
    res.render('../api/search_author');
});

app.get('/admin-page', isAdmin, (req, res) => {
    res.render('views/admin-panel');
});

app.get("/home",async (req, res) => {
    try {
        const books = await collection.BookModel.find();
        console.log(books)
        res.render('home', {books:books});
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get('/access_denied', (req, res) => {
    res.render('../views/admin-panel'); 
  });

app.get('/bookManagement',(req, res) => {
    res.render('../rest-api/bookManagement');
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
            if (data.name === "balzhan" && data.password ==='123'){
                data.isAdmin = true;
            }
            const hashedPassword = await bcrypt.hash(data.password, 10);
            data.password = hashedPassword;
            console.log(data.name)
            console.log(data.password)
            

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
        console.log(user)
        if (!user) {
            res.send("User name not found");
        } else {
            const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
            console.log(isPasswordValid)

            if (isPasswordValid) {
                req.session.user = user;
                if (user.isAdmin) {

                    res.redirect('/admin-panel');
                } else {
                    res.redirect("/home");
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

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        } else {
            console.log('Session destroyed successfully');
        }
        res.redirect('/login');
    });
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


app.get('/admin-panel', isAdmin, async (req, res) => {
    try {
        const books = await collection.BookModel.find();
        res.render('admin-panel', { books });
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to fetch books for Admin Panel.");
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../uploads/') 
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
const upload = multer({ storage: storage });

app.post('/admin-panel/add-book', isAdmin, upload.array('images[]'), async (req, res) => {
    const { description1,title2,description2, title1 } = req.body;
    const imageUrls = req.files.map(file => {
        const correctedPath = file.path.replace(/\\/g, '/');
        return correctedPath;
    });

    console.log(description1,title2,description2, title1,)
    console.log(imageUrls)
    try {
        const newBook = await collection.BookModel.create({
            images: imageUrls,
            titles: {
                language1: title1,
                language2: title2,
            },
            descriptions: {
                language1: description1,
                language2: description2,
            },
        });
        console.log(newBook)

        res.redirect('/admin-panel');
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to add a new book.");
    }
});

app.get('/admin-panel/edit-book/:bookId', isAdmin, async (req, res) => {
    const bookId = req.params.bookId;

    try {
        const book = await collection.BookModel.findById(bookId);
        res.render('admin-edit-book', { book });
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to fetch book for editing.");
    }
});

app.post('/admin-panel/update-book/:bookId', isAdmin, async (req, res) => {
    const bookId = req.params.bookId;
    console.log(req.body)
    const {description1,title2,description2, title1 } = req.body;
    console.log(description1,title2,description2, title1)
    console.log(bookId)
    try {
        const book = await collection.BookModel.findById(bookId);
        if (!book) {
            return res.status(404).send('Course not found');
        }
        if (description1) {
            book.descriptions.language1 = description1;
        }
        if (title2) {
            book.titles.language2 = title2
        }
        if (description2) {
            book.descriptions.languageduration1  = description2;
        }
        if (title1) {
            book.titles.language1 = title1;
        }
        const updatedBook = await book.save();

        const books = await collection.BookModel.find();
        res.redirect('/admin-panel')
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/admin-panel/delete-book/:bookId', isAdmin, async (req, res) => {
    const bookId = req.params.bookId;

    try {
        await collection.BookModel.findByIdAndDelete(bookId);
        res.redirect('/admin-panel');
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to delete the book.");
    }
});

app.post("/search", async (req, res) => {
    const title = req.body.title;
    const apiUrl = `http://openlibrary.org/search.json?title=${title}`;

    try {
        const response = await axios.get(apiUrl);
        const booksData = response.data.docs;

        const bookInfo = booksData[0];
        const additionalContent = {
            title: bookInfo.title,
            author: bookInfo.author_name ? bookInfo.author_name.join(', ') : '',
            firstPublishYear: bookInfo.first_publish_year || '',
            publishYears: bookInfo.publish_year || [],
        };

        const userName = req.session.user;

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
    const authorQuery = req.body.author;
    const apiUrl = `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(authorQuery)}`;

    try {
        const response = await axios.get(apiUrl);
        const authorsData = response.data.docs;

        res.render('../api/books_by_author', { authorsData });
    } catch (error) {
        console.error(error);
        res.render('error_page', { error: "Error fetching author data" });
    }
});

const routes = require('./routes');
const middleware = require('./middleware');

app.use(session({
    secret: 'prikol',
    resave: false,
    saveUninitialized: true,
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.use((req, res, next) => {
    if (
      req.path === "/" ||
      req.path.startsWith("/login")  ||
      req.path.startsWith("/signup")
    ) {
      next();
    } else {
     isAuthenticated; 
    }
})

app.use('/api', routes);

app.get('/secure-page', middleware.isAuthenticated, (req, res) => {
    res.render('secure_page');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
