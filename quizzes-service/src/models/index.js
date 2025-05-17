const Quiz = require('./quiz.model');
const QuizQuestion = require('./quizQuestion.model');
const QuizAnswer = require('./quizAnswer.model');

// Definiowanie relacji
Quiz.hasMany(QuizQuestion, { foreignKey: 'quizId' });
QuizQuestion.belongsTo(Quiz, { foreignKey: 'quizId' });

QuizQuestion.hasMany(QuizAnswer, { foreignKey: 'questionId' });
QuizAnswer.belongsTo(QuizQuestion, { foreignKey: 'questionId' });

module.exports = {
  Quiz,
  QuizQuestion,
  QuizAnswer
}; 