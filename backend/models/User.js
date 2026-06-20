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

// PASSWORD HASHING MIDDLEWARE (NO 'next' ARGUMENT)
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err; // Mongoose will catch this and reject the save
  }
});

module.exports = mongoose.model("User", UserSchema);