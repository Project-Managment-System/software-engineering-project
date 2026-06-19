const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. DATABASE CONNECTION
const connectDB = require('./config/db'); 

const app = express();

// 2. MIDDLEWARE
// Ensure these are placed before your routes to parse incoming JSON correctly
app.use(express.json());
app.use(cors());

// 3. ESTABLISH DATABASE LINK
connectDB();

// 4. DEFINE ROUTES
// Auth Routes
app.use('/api/auth', require('./routes/authRoutes')); 

// Project Routes
// All routes defined in projectRoutes.js are now prefixed with /api/projects
app.use('/api/projects', require('./routes/projectRoutes')); 

// 5. GLOBAL ERROR HANDLING
app.use((err, req, res, next) => {
  console.error("[SYSTEM ERROR]:", err.stack);
  res.status(err.status || 500).json({
    error: err.message || "INTERNAL_SERVER_ERROR"
  });
});

// ... existing imports ...
app.use('/api/projects', require('./routes/projectRoutes')); 

// ADD THIS LINE:
app.use('/api/users', require('./routes/userRoutes'));

// 6. INITIALIZE SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log("------------------------------------------");
  console.log(`[CORE]: SERVER_ACTIVE_ON_PORT_${PORT}`);
  console.log(`[CORE]: API_PROJECTS_READY_AT /api/projects`);
  console.log("------------------------------------------");
});