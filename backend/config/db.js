const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    // In Mongoose 6+, these options are default. 
    // We just need the URI.
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log("------------------------------------------");
    console.log(`>>> CEMS DATABASE SYNCED: ${conn.connection.host}`);
    console.log("------------------------------------------");
  } catch (err) {
    console.error(">>> CEMS DATABASE SYNCED: FAILED");
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;