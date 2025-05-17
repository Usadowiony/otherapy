const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const QuizQuestion = sequelize.define('QuizQuestion', {
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'quiz_questions',
  timestamps: false
});

module.exports = QuizQuestion;
