// app.js
const express = require('express');
const path = require('path');
const authController = require('./controllers/authController');
const portfolioController = require('./controllers/portfolioController');
const session = require('express-session');
const dotenv = require('dotenv');
const upload = require('./utils/uploadUtils');

dotenv.config({ path: './config.env' });
function isLoggedIn(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

const app = express();
app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 }
}));
console.log(process.env.SESSION_SECRET);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Serve registration form
app.get('/register', (req, res) => res.render('register'));

// Handle registration
app.post('/register', authController.register);

app.get('/', (req, res) => res.redirect('/login'));
// Serve login form
app.get('/login', (req, res) => res.render('login'));

// Handle login
app.post('/login', authController.login);

// Serve logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// Serve home
app.get('/home', isLoggedIn, portfolioController.getAllPortfolioItems, (req, res) => {
    res.render('home', { user: req.session.user, posts: res.locals.data.portfolioItems });
});

app.get('/dashboard', isLoggedIn, portfolioController.getAllPortfolioItems, (req, res) => {
    res.render('dashboard', { user: req.session.user , posts: res.locals.data.portfolioItems});
});

app.post('/delete', portfolioController.deletePortfolioItem);

app.post('/newpost', upload.array('images', 3), portfolioController.addPortfolioItem);

app.post('/edit', upload.array('editimages', 3), portfolioController.editPortfolioItem);

app.get('/airquality', (req, res) => {
    res.render('airquality');
});

module.exports = app;

