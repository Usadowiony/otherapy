const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const { verifyToken } = require('../middleware/authMiddleware');

// Usunięta obsługa tras tagów. Zarządzanie tagami odbywa się wyłącznie przez tags-service.

module.exports = router;