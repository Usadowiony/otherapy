const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = () => {
  return jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Sprawdź czy to admin
    if (username === process.env.ADMIN_USERNAME && 
        password === process.env.ADMIN_PASSWORD) {
      res.json({
        token: generateToken()
      });
    } else {
      res.status(401).json({ message: 'Nieprawidłowa nazwa użytkownika lub hasło' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// @desc    Get admin profile
// @route   GET /api/auth/profile
// @access  Private
const getAdminProfile = async (req, res) => {
  try {
    res.json({
      username: process.env.ADMIN_USERNAME,
      role: 'admin'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

module.exports = {
  loginAdmin,
  getAdminProfile
}; 