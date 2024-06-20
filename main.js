require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 4000;
const authRoutes = require('./routes/auth');
// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
    secret: 'mysecret',
    saveUninitialized: true,
    resave: false,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});
///static for image
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));


// Set template engine
app.set("view engine", "ejs");
// Use the auth routes
app.use('/auth', authRoutes);

// Routes prefix
app.use('/', require('./routes/routes'));

// Database connection
mongoose.connect(process.env.DB_URI)
    .then(() => {
        console.log("Connected to the database.");

        // Start the server only after the database connection is established
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database connection error:", error);
    });
