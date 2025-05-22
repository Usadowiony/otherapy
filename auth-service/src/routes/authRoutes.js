const express = require('express');
const router = express.Router();
const { loginAdmin, getAdminProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', loginAdmin);

// Protected routes
router.get('/profile', protect, getAdminProfile);

// Odśwież token (refresh) – generuje nowy token jeśli stary jest ważny
router.post('/refresh', protect, (req, res) => {
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
  res.json({ token });
});

module.exports = router;