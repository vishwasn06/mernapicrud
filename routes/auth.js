const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/t_login');

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create a new user
        user = new User({ username, email, password });
        await user.save();

        req.session.message = {
            type: 'success',
            message: 'User registered successfully. Please log in.',
        };

        res.redirect('/login'); // Redirect to login page after registration
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const payload = { userId: user._id };
        const token = jwt.sign(payload, 'your_jwt_secret', { expiresIn: '1h' });

        // Save token in session
        req.session.token = token;

        res.redirect('/home'); // Redirect to home page after login
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
