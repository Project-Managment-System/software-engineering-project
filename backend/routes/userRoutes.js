const express = require('express');
const router = express.Router();
// Assuming you have a User model imported
const User = require('../models/User'); 

// Ensure you have an async function with await
router.post('/add', async (req, res) => {
    try {
        // Map frontend fields to match your Mongoose Schema
        const userData = {
            fullName: `${req.body.firstName} ${req.body.secondName}`,
            employeeId: req.body.employeeId,
            email: req.body.email,
            password: req.body.password,
            division: req.body.division,
            role: 'engineer' // Force a default role if not provided
        };

        const newUser = new User(userData);
        await newUser.save();
        res.status(201).json({ message: "User saved successfully!" });
    } catch (err) {
        console.error("DEBUG ERROR:", err.message);
        res.status(400).json({ error: err.message });
    }
});

// Add this to your userRoutes.js
router.get('/', async (req, res) => {
    try {
        const users = await User.find(); // Fetches all users from DB
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;