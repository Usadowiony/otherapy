const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const quizRoutes = require('./routes/quiz.routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/quiz', quizRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3002;

async function startServer() {
  try {
    await sequelize.sync();
    console.log('Database synchronized successfully');
    
    app.listen(PORT, () => {
      console.log(`Quizzes service is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

startServer();
