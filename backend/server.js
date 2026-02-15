const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. IMPORT DATABASE CONNECTION
// This matches your path: backend/config/db.js
const connectDB = require('./config/db'); 

const app = express();

// 2. MIDDLEWARE
// express.json() MUST be above your routes to parse the registration data
app.use(express.json());
app.use(cors());

// 3. ESTABLISH DATABASE LINK
connectDB();

// 4. DEFINE ROUTES
// This links to your backend/routes/authRoutes.js
// Your registration URL will be: http://127.0.0.1:5000/api/auth/enroll
app.use('/api/auth', require('./routes/authRoutes')); 

// 5. GLOBAL ERROR HANDLING
// This catches any errors passed via 'next(err)' in your controllers
app.use((err, req, res, next) => {
  console.error("[SYSTEM ERROR]:", err.stack);
  res.status(err.status || 500).json({
    error: err.message || "INTERNAL_SERVER_ERROR"
  });
});

// 6. INITIALIZE SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log("------------------------------------------");
  console.log(`[CORE]: SERVER_ACTIVE_ON_PORT_${PORT}`);
  console.log(`[DEBUG]: Local access: http://127.0.0.1:${PORT}`);
  console.log("------------------------------------------");
});