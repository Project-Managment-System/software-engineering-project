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

// Add this to your userRoutes.js file
router.delete('/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
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
router.put('/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;