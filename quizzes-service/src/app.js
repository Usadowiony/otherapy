const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./models');
const quizRoutes = require('./routes/quizRoutes');
const questionRoutes = require('./routes/questionRoutes');
const answerRoutes = require('./routes/answerRoutes');
const quizDraftRoutes = require('./routes/quizDraftRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
app.use('/api/quizzes', quizRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/quiz-drafts', quizDraftRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Start server
const startServer = async () => {
  try {
    await initDatabase();
    const port = process.env.PORT || 3004;
    app.listen(port, () => {
      console.log(`Quizzes service is running on port ${port} [${process.env.NODE_ENV || 'development'}]`);
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to start server:`, error);
    process.exit(1);
  }
};

startServer();