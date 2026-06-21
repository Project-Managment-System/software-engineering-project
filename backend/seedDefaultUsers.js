/**
 * seedDefaultUsers.js
 *
 * One-time script to create the 9 default system accounts:
 *   - 8 division engineers
 *   - 1 clerk (admin role)
 *
 * Safe to re-run: it skips any employeeId that already exists,
 * so it won't create duplicates or throw unique-key errors.
 *
 * USAGE:
 *   1. Adjust MONGO_URI below to match your actual connection string
 *      (copy it from your server.js / .env file).
 *   2. Run:  node seedDefaultUsers.js
 *
 * IMPORTANT:
 *   - Passwords here are carried over from the original hardcoded
 *     frontend codes (e.g. 'ae1', 'cl1') purely for continuity.
 *     They will be bcrypt-hashed automatically by the User model's
 *     pre('save') hook. You should change these to stronger passwords
 *     once everyone has logged in at least once.
 *   - Email addresses are placeholders (employeeId@cems.local) because
 *     the schema requires a unique email. Update them to real addresses
 *     if/when you have them.
 */

require("dotenv").config(); // loads MONGODB_URI from your .env file

const mongoose = require("mongoose");
const User = require("./models/User"); // adjust path if this script lives elsewhere

// Matches the MONGODB_URI variable name used in your .env / config/db.js
const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/civilManagement";

const defaultUsers = [
  { employeeId: "enae1", password: "ae1", division: "Anuradhapura-East",  fullName: "Engineer - Anuradhapura East" },
  { employeeId: "enaw1", password: "aw1", division: "Anuradhapura-West",  fullName: "Engineer - Anuradhapura West" },
  { employeeId: "enme1", password: "me1", division: "Medawachchiya",     fullName: "Engineer - Medawachchiya" },
  { employeeId: "enmi1", password: "mi1", division: "Mihinthale",        fullName: "Engineer - Mihinthale" },
  { employeeId: "enth1", password: "th1", division: "Thambuththegama",  fullName: "Engineer - Thambuththegama" },
  { employeeId: "enke1", password: "ke1", division: "Kekirawa",         fullName: "Engineer - Kekirawa" },
  { employeeId: "enpo1", password: "po1", division: "Polonnaruwa",      fullName: "Engineer - Polonnaruwa" },
  { employeeId: "enhi1", password: "hi1", division: "Higurakgoda",      fullName: "Engineer - Higurakgoda" },
].map(u => ({ ...u, role: "engineer" }));

const clerkUser = {
  employeeId: "cl0001",
  password: "cl1",
  role: "admin",
  fullName: "Clerk / Admin",
  // division omitted: only required when role === 'engineer'
};

const allUsers = [...defaultUsers, clerkUser];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log(">>> Connected to MongoDB:", MONGO_URI);

  for (const u of allUsers) {
    const existing = await User.findOne({ employeeId: u.employeeId });
    if (existing) {
      console.log(`>>> SKIP (already exists): ${u.employeeId}`);
      continue;
    }

    const user = new User({
      fullName: u.fullName,
      employeeId: u.employeeId,
      email: `${u.employeeId.toLowerCase()}@cems.local`,
      password: u.password, // hashed automatically by pre('save') hook
      role: u.role,
      division: u.division, // undefined for clerk, which is fine
      isVerified: true,
    });

    await user.save();
    console.log(`>>> CREATED: ${u.employeeId} (${u.role})`);
  }

  console.log(">>> Seeding complete.");
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(">>> SEED FAILED:", err);
  process.exit(1);
});