const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Brak tokenu autoryzacyjnego' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Nieprawidłowy token' });
  }
};

module.exports = authMiddleware;
