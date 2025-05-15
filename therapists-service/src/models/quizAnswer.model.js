const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const QuizQuestion = require('./quizQuestion.model');
const Tag = require('./tag.model');

const QuizAnswer = sequelize.define('QuizAnswer', {
  answer: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'quiz_answers',
  timestamps: false
});

// Relacje
QuizAnswer.belongsTo(QuizQuestion);
QuizAnswer.belongsToMany(Tag, { through: 'quiz_answer_tags' });
Tag.belongsToMany(QuizAnswer, { through: 'quiz_answer_tags' });

module.exports = QuizAnswer;
