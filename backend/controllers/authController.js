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
      unitId, 
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

    // 3. PREPARE USER OBJECT
    const userRole = role ? role.toLowerCase() : "ops";
    
    const user = new User({
      fullName,
      email: email.toLowerCase(),
      password,
      role: userRole,
      // SET TO TRUE: Prevents the "Maintenance Required" block for new users
      isVerified: true, 
      attributes: {
        unitId: unitId || "Unassigned",
        clearanceLevel: "LVL_1", 
        discipline: userRole === "engineer" ? "Engineering" : "Civil Engineering",
        designation: userRole === "engineer" ? "Structural Engineer" : "Field Officer"
      },
      recoveryQuestion: recoveryQuestion || "system_override",
      recoveryAnswer: recoveryAnswer || "default_recovery"
    });

    // 4. SAVE TO DATABASE
    console.log(`>>> [DB]: ATTEMPTING TO SAVE ${userRole.toUpperCase()} TO DATABASE...`);
    await user.save();
    
    console.log(">>> [DB]: SAVE SUCCESSFUL. USER_ID:", user._id);

    // 5. SUCCESS RESPONSE
    res.status(201).json({
      status: "SUCCESS",
      message: "User registered successfully",
      userId: user._id
    });

  } catch (err) {
    console.error(">>> [CONTROLLER ERROR]:", err);
    res.status(500).json({ 
      error: "REGISTRATION_FAILED", 
      message: err.message, 
      details: err.errors ? Object.keys(err.errors) : "Internal Server Error"
    });
  }
};

// LOGIN PERSONNEL
// NOTE: Login is now by employeeId (the system "username"), not email.
exports.login = async (req, res, next) => {
  try {
    const { employeeId, password } = req.body;
    console.log(`>>> [AUTH]: LOGIN ATTEMPT FOR EMPLOYEE ID: ${employeeId}`);

    if (!employeeId || !password) {
      return res.status(400).json({ error: "MISSING_CREDENTIALS" });
    }

    const user = await User.findOne({ employeeId });
    if (!user) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    /**
     * FIX: AUTOMATIC ACCOUNT ACTIVATION
     * If the user is found but not verified, we force it to true here.
     * This handles old accounts that were created before we fixed the enroll function.
     */
    if (user.isVerified === false) {
      console.log(`>>> [AUTH]: AUTO-VERIFYING ACCOUNT FOR: ${employeeId}`);
      user.isVerified = true;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "INVALID_PASSWORD" });
    }

    // Update login timestamp
    user.lastLogin = new Date();
    
    // Save the verification status and login time
    await user.save({ validateBeforeSave: false });

    console.log(`>>> [AUTH]: LOGIN GRANTED FOR ${user.fullName}`);

    res.json({
      status: "LOGIN_SUCCESS",
      role: user.role,
      division: user.division,
      userId: user._id,
      employeeId: user.employeeId,
      fullName: user.fullName,
      email: user.email,
      division: user.division || null,
      // Explicitly send true so the frontend allows the session
      isVerified: true 
    });
  } catch (err) {
    console.error(">>> [LOGIN ERROR]:", err);
    res.status(500).json({ error: err.message });
  }
};