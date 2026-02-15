const express = require("express");
const router = express.Router();

// Import the functions from your authController
const {
  enroll, 
  login
} = require("../controllers/authController");

// ===============================
// AUTH ROUTES
// Base URL in server.js: /api/auth
// ===============================

/**
 * @route   POST /api/auth/enroll
 * @desc    Register a new user (Match for Register.jsx)
 * This must be "/enroll" to match your axios.post call
 */
router.post("/enroll", enroll);

/**
 * @route   POST /api/auth/login
 * @desc    Login for all roles
 */
router.post("/login", login);

/**
 * @route   POST /api/auth/reset
 * @desc    Dummy reset route
 */
router.post("/reset", (req, res) => {
  res.status(200).json({ message: "Reset password not implemented yet" });
});

module.exports = router;