const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  employeeId: { type: String, required: true, unique: true, trim: true }, 
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "engineer"], default: "engineer", required: true },
  division: { type: String, required: function() { return this.role === 'engineer'; } },
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

// Password Comparison Method — required by authController.js's login function
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);