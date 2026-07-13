const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/chatbotController');

// POST /api/chatbot/query — Engineer chatbot endpoint
router.post('/query', handleChat);

module.exports = router;
