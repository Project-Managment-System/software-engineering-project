const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  employeeId: { type: String, required: true, unique: true, trim: true }, 
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "engineer", "division_assistant", "technical_officer", "clerk"],
    default: "engineer",
    required: true
  },
  division: {
    type: String,
    required: function () {
      return this.role !== 'admin';
    }
  },
  phoneNo: { type: String, default: '' },
  profilePic: { type: String, default: '' },
}, { timestamps: true });

UserSchema.pre("save", async function () {
  // Ensure that a division has only one engineer, only when role/division changes or user is new
  if (this.role === "engineer" && this.division && (this.isNew || this.isModified("role") || this.isModified("division"))) {
    const existingEngineer = await this.constructor.findOne({
      role: "engineer",
      division: this.division,
      _id: { $ne: this._id }
    });
    if (existingEngineer) {
      throw new Error(`Division "${this.division}" already has an assigned engineer.`);
    }
  }

  // Password Hashing Middleware
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Password Comparison Method — required by authController.js's login function
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);