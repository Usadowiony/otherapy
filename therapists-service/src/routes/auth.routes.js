const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD } = require('../config/jwt');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign(
      { username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Nieprawidłowe dane logowania' });
  }
});

module.exports = router;
