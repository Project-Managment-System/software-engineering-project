const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db'); 
const app = express();

// --- CRITICAL: MIDDLEWARE MUST BE AT THE TOP ---
app.use(express.json({ limit: '50mb' })); // This parses your PATCH body with a 50mb limit for PDF/image uploads
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// --- DATABASE ---
connectDB();

// --- ROUTES (Define each prefix only ONCE) ---
app.use('/api/auth', require('./routes/authRoutes')); 
app.use('/api/projects', require('./routes/projectRoutes')); // This is the ONLY project line
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// --- ERROR HANDLING ---
app.use((err, req, res, next) => {
  console.error("[SYSTEM ERROR]:", err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[CORE]: Server active on port ${PORT}`);
});