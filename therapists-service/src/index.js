const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const therapistRoutes = require('./routes/therapist.routes');
const tagRoutes = require('./routes/tag.routes');
const authRoutes = require('./routes/auth.routes');
const authMiddleware = require('./middleware/auth.middleware');

const app = express();
app.use(cors());
app.use(express.json());

// Publiczne endpointy
app.use('/auth', authRoutes);

// Zabezpieczone endpointy
app.use('/therapists', authMiddleware, therapistRoutes);
app.use('/tags', authMiddleware, tagRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Wystąpił błąd serwera' });
});

const PORT = process.env.PORT || 3001;
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
