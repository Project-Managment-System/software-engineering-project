const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  
  // employeeId is now critical as the "username" for logging in
  employeeId: { type: String, required: true, unique: true, trim: true }, 
  
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },

  // Role management for Admin vs Engineer
  role: {
    type: String,
    enum: ["admin", "engineer"],
    default: "engineer",
    required: true,
  },

  // Division field: Crucial for your filter requirement
  // Options will be "Division 1", "Division 2", ... "Division 8"
  division: { 
    type: String, 
    required: function() { return this.role === 'engineer'; } 
  },

  attributes: {
    clearanceLevel: { type: String, enum: ["LVL_1", "LVL_2", "LVL_3"] },
    discipline: String,
    designation: String,
    unitId: String,
  },

  // Recovery fields
  recoveryQuestion: { type: String },
  recoveryAnswer: { type: String },

  neuralPatternHash: String,
  enrollmentDate: { type: Date, default: Date.now },
  lastLogin: Date,
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

// Password Hashing Middleware
// NOTE: async pre-save hooks do NOT receive a `next` callback in this
// Mongoose version. Just return normally on success, or throw on error —
// Mongoose automatically converts a thrown error into the save() rejection.
UserSchema.pre("save", async function () {
  // If the password hasn't been changed, skip hashing
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Password Comparison Method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);