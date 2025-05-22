const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role === 'admin') {
        req.user = { role: 'admin' };
        next();
      } else {
        res.status(403).json({ message: 'Brak uprawnień administratora' });
      }
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Nieautoryzowany dostęp' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Brak tokena autoryzacyjnego' });
  }
};

module.exports = { protect };