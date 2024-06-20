const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs = require('fs');

// Image upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({
    storage: storage,
    
}).single('image');

// Route to render home page with pagination and sorting
router.get("/home", async (req, res) => {
    const limit = parseInt(req.query.limit) || 10; // Number of users per page
    const page = parseInt(req.query.page) || 1; // Current page number
    const sortField = req.query.sortField || '_id'; // Field to sort by
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1; // Sort order

    try {
        const totalUsers = await User.countDocuments(); // Total number of users
        const totalPages = Math.ceil(totalUsers / limit); // Total number of pages

        const users = await User.find()
            .sort({ [sortField]: sortOrder })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        res.render('index', {
            title: 'Home page',
            users: users,
            currentPage: page,
            totalPages: totalPages,
            limit: limit,
            sortField: sortField,
            sortOrder: sortOrder,
            message: req.session.message,
        });
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

// Route to add a user
router.post('/add', upload, async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            image: req.file.filename,
            phone: req.body.phone,
            gender: req.body.gender,
            course: req.body.course,
            desgination: req.body.desgination,
            datecreated: new Date(),
            active: true,
        });

        await user.save();

        req.session.message = {
            type: 'success',
            message: 'Employee added successfully',
        };

        res.redirect('/home');
    } catch (err) {
        // Check if the error is due to duplicate key (email)
        if (err.code === 11000 || err.code === 11001) {
            const errors = { email: { msg: 'Email already exists' } };
            res.render('add_users', { title: 'Add User', errors: errors });
        } else {
            res.json({ message: err.message, type: 'danger' });
        }
    }
});

// Route to render add user page
router.get('/add', (req, res) => {
    res.render('add_users', { title: 'Add User', errors: null }); // Pass errors as null initially
});

// Route to edit a user
router.get('/edit/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).exec();
        res.render('edit_users', { title: 'Edit employee', user: user });
    } catch (err) {
        res.json({ message: err.message });
    }
});

router.post('/update/:id', upload, async (req, res) => {
    const id = req.params.id;
    let newImage = '';

    if (req.file) {
        newImage = req.file.filename;
        try {
            fs.unlinkSync('./uploads/' + req.body.old_image);
        } catch (err) {
            console.log(err);
        }
    } else {
        newImage = req.body.old_image;
    }

    try {
        await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            course: req.body.course,
            desgination: req.body.desgination,
            image: newImage
        });

        req.session.message = {
            type: 'success',
            message: 'Employee updated successfully',
        };

        res.redirect('/home');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

// Route to delete a user
router.get('/delete/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id).exec();
        if (user && user.image) {
            try {
                fs.unlinkSync('./uploads/' + user.image);
            } catch (err) {
                console.log(err);
            }
        }

        req.session.message = {
            type: 'success',
            message: 'Employee deleted successfully',
        };

        res.redirect('/home');
    } catch (err) {
        res.json({ message: err.message });
    }
});

// Route to activate/deactivate a user
router.get('/toggle-status/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).exec();
        user.active = !user.active;
        await user.save();

        req.session.message = {
            type: 'success',
            message: `Employee ${user.active ? 'activated' : 'deactivated'} successfully`,
        };

        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message });
    }
});

//
router.get('/register', (req, res) => {
    res.render('register', { message: req.session.message || null, title: 'Register' });
});

// Route to render login form
router.get('/', (req, res) => {
    res.render('login', { message: req.session.message || null, title: 'Login' });
});

// Route to handle user logout
router.get('/logout', (req, res) => {
    req.session.destroy(); // Destroy session
    res.redirect('/'); // Redirect to login page after logout
});
module.exports = router;
