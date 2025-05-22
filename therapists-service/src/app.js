require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./models');
const therapistRoutes = require('./routes/therapistRoutes');
const tagRoutes = require('./routes/tagRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

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

// Routes
app.use('/api/therapists', therapistRoutes);
app.use('/api/tags', tagRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, err);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Inicjalizacja bazy danych i start serwera
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Therapists service is running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to start server:`, error);
    process.exit(1);
  }
};

startServer();