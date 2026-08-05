const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const app = express();

// --- CRITICAL: MIDDLEWARE MUST BE AT THE TOP ---
// CORS runs first so preflight/rejected-origin requests are settled before the cost of body
// parsing — pure ordering change, the cors() config itself (allow-all) is unchanged.
app.use(cors());
// Security headers. CSP is off: this server only ever returns JSON to XHR calls, never HTML
// pages, so a content-security-policy has nothing to protect here and only risks interfering
// with responses if left on with its default (browser-page-oriented) settings.
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
// Gzip/deflate compression of JSON responses — transparent to clients, no response shape change.
app.use(compression());
app.use(express.json({ limit: '50mb' })); // This parses your PATCH body with a 50mb limit for PDF/image uploads
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rate limiting is scoped to the auth endpoints only (brute-force/credential-stuffing surface).
// The rest of the API is intentionally left unthrottled — several dashboards poll endpoints
// like /api/messages/unread every few seconds per active session, and a blanket limit would
// risk locking out real, legitimate usage rather than actual abuse.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again later.' }
});
app.use('/api/auth', authLimiter);

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