require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const tagRoutes = require('./routes/tagRoutes');

const app = express();

// CORS - pozwala na połączenia z frontendu (np. React na localhost:3000)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(tagRoutes);

// Czytelne logi requestów (tylko w dev)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const ms = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${ms}ms`);
    });
    next();
  });
}

// Error handling
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 3003;
(async () => {
  try {
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`Tags service running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to start server:`, error);
    process.exit(1);
  }
})();