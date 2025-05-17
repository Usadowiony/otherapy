const express = require('express');
const router = express.Router();
const { loginAdmin, getAdminProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', loginAdmin);

// Protected routes
router.get('/profile', protect, getAdminProfile);

module.exports = router; 