const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

function adminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Brak nagłówka Authorization' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Brak tokena JWT' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload.isAdmin) return res.status(403).json({ error: 'Brak uprawnień administratora' });
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Nieprawidłowy token JWT' });
  }
}

module.exports = { adminAuth };
