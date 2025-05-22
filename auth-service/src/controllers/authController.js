const jwt = require('jsonwebtoken');

const generateToken = () => {
  return jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

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