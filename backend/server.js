const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db'); 
const app = express();

// --- CRITICAL: MIDDLEWARE MUST BE AT THE TOP ---
app.use(express.json()); // This parses your PATCH body
app.use(cors());

// --- DATABASE ---
connectDB();

// --- ROUTES (Define each prefix only ONCE) ---
// --- ERROR HANDLING ---
app.use((err, req, res, next) => {
  console.error("[SYSTEM ERROR]:", err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[CORE]: Server active on port ${PORT}`);
});