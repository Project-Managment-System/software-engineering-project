/**
 * resetPassword.js
 *
 * Admin utility to reset a user's password when the current one is unknown.
 *
 * USAGE:
 *   node resetPassword.js <employeeId> <newPassword>
 *   e.g. node resetPassword.js enke1 ke1
 *
 * The new password is bcrypt-hashed by the User model's pre('save') hook.
 */

require("dotenv").config(); // loads MONGODB_URI from your .env file

const mongoose = require("mongoose");
const User = require("./models/User");

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/civilManagement";

async function reset() {
  const [employeeId, newPassword] = process.argv.slice(2);

  if (!employeeId || !newPassword) {
    console.error(">>> USAGE: node resetPassword.js <employeeId> <newPassword>");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);

  const user = await User.findOne({ employeeId });
  if (!user) {
    console.error(`>>> USER NOT FOUND: ${employeeId}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  user.password = newPassword; // hashed automatically by pre('save') hook
  await user.save({ validateBeforeSave: false });

  console.log(`>>> PASSWORD RESET FOR: ${employeeId}`);
  await mongoose.disconnect();
}

reset().catch(err => {
  console.error(">>> RESET FAILED:", err);
  process.exit(1);
});
