const sequelize = require('../config/database');
const Quiz = require('./Quiz');
const Question = require('./Question');
const Answer = require('./Answer');

// Definiowanie relacji
Quiz.hasMany(Question, { foreignKey: 'quizId' });
Question.belongsTo(Quiz, { foreignKey: 'quizId' });

Question.hasMany(Answer, { foreignKey: 'questionId' });
Answer.belongsTo(Question, { foreignKey: 'questionId' });

// Synchronizacja z bazą danych
const initDatabase = async () => {
  try {
    // Testujemy połączenie
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Synchronizujemy modele
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
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
  initDatabase
}; 