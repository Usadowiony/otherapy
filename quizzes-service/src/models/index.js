const sequelize = require('../config/database');
const Quiz = require('./Quiz');
const Question = require('./Question');
const Answer = require('./Answer');
const QuizDraft = require('./QuizDraft');

// Synchronizacja z bazą danych
const initDatabase = async () => {
  try {
    // Testujemy połączenie
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    // Synchronizujemy modele (tworzy QuizDraft automatycznie)
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  Quiz,
  Question,
  Answer,
  QuizDraft,
  initDatabase
};