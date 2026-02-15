const User = require("../models/User");

// REGISTER PERSONNEL
exports.enroll = async (req, res, next) => {
  try {
    console.log(">>> [AUTH]: ENROLL REQUEST RECEIVED");
    
    const {
      fullName, 
      email, 
      password, 
      confirmPassword,
      role, 
      unitId, // This comes from 'sector' in Register.jsx
      recoveryQuestion,
      recoveryAnswer
    } = req.body;

    // 1. BASIC VALIDATION
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: "MISSING_REQUIRED_FIELDS" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "PASSWORD_MISMATCH" });
    }

    // 2. CHECK FOR EXISTING USER
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.warn(`>>> [AUTH]: ENROLL FAILED - Email ${email} already exists.`);
      return res.status(400).json({ error: "USER_EXISTS" });
    }

    // 3. PREPARE USER OBJECT (Matching User.js Schema exactly)
    const user = new User({
      fullName,
      email: email.toLowerCase(),
      password,
      role: role || "ops", 
      attributes: {
        unitId: unitId || "Unassigned",
        clearanceLevel: "LVL_1", // MANDATORY: Must match Model Enum ["LVL_1", "LVL_2", "LVL_3"]
        discipline: "Civil Engineering",
        designation: "Field Officer"
      },
      recoveryQuestion: recoveryQuestion || "system_override",
      recoveryAnswer: recoveryAnswer || "default_recovery"
    });

    // 4. SAVE TO DATABASE
    console.log(">>> [DB]: ATTEMPTING TO SAVE USER TO civilManagement...");
    await user.save();
    
    console.log(">>> [DB]: SAVE SUCCESSFUL. USER_ID:", user._id);

    // 5. SUCCESS RESPONSE
    res.status(201).json({
      status: "SUCCESS",
      message: "User registered successfully",
    });

  } catch (err) {
    console.error(">>> [CONTROLLER ERROR]:", err);
    res.status(500).json({ 
      error: "REGISTRATION_FAILED", 
      details: err.message 
    });
  }
};

// LOGIN PERSONNEL
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(`>>> [AUTH]: LOGIN ATTEMPT FOR: ${email}`);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "INVALID_PASSWORD" });
    }

    user.lastLogin = new Date();
    await user.save();

    res.json({
      status: "LOGIN_SUCCESS",
      role: user.role,
      userId: user._id,
      fullName: user.fullName,
    });
  } catch (err) {
    console.error(">>> [LOGIN ERROR]:", err);
    res.status(500).json({ error: err.message });
  }
};