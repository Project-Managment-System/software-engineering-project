const express = require('express');
const router = express.Router();
const User = require('../models/User'); 

// Ensure you have an async function with await
router.post('/add', async (req, res) => {
    try {
        const userData = {
            fullName: req.body.fullName || `${req.body.firstName || ''} ${req.body.secondName || ''}`.trim(),
            employeeId: req.body.employeeId,
            email: req.body.email,
            password: req.body.password,
            division: req.body.division,
            role: 'engineer'
        };

        const newUser = new User(userData);
        await newUser.save();
        res.status(201).json({ message: "User saved successfully!" });
    } catch (err) {
        console.error("DEBUG ERROR:", err.message);
        res.status(400).json({ error: err.message });
    }
});

// Delete user
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

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update user details
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

// Change password for a logged-in user. Requires the current password to be correct.
router.patch('/:id/password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: "MISSING_FIELDS" });
        }
        if (newPassword.length < 4) {
            return res.status(400).json({ error: "PASSWORD_TOO_SHORT" });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "USER_NOT_FOUND" });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ error: "INCORRECT_CURRENT_PASSWORD" });
        }

        user.password = newPassword; // pre('save') hook hashes it
        await user.save();

        res.json({ status: "PASSWORD_UPDATED" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single user details by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: "USER_NOT_FOUND" });
        }
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: "INVALID_USER_ID" });
    }
});

module.exports = router;