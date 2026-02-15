const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  // sparse: true allows multiple "null" values for unique fields
  employeeId: { type: String, unique: true, sparse: true }, 
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["admin", "engineer", "ops"],
    default: "ops", // Default to 'ops' if frontend doesn't send it
    required: true,
  },

  attributes: {
    clearanceLevel: { type: String, enum: ["LVL_1", "LVL_2", "LVL_3"] },
    discipline: String,
    designation: String,
    unitId: String,
  },

  // Added recovery fields from your frontend
  recoveryQuestion: { type: String },
  recoveryAnswer: { type: String },

  neuralPatternHash: String,
  enrollmentDate: { type: Date, default: Date.now },
  lastLogin: Date,
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

// CORRECTED: Password Hashing Middleware (Async Version)
UserSchema.pre("save", async function () {
  // If the password hasn't been changed, don't re-hash it
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    // In async pre-save hooks, we do NOT call next(). 
    // Simply returning or finishing execution proceeds with the save.
  } catch (err) {
    // Throwing an error will stop the save and trigger the catch block in your controller
    throw err;
  }
});

// Password Comparison Method
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);