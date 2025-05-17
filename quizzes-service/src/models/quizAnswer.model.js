const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuizAnswer = sequelize.define('QuizAnswer', {
  answer: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tagPoints: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
  },
  questionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'quiz_answers',
  timestamps: false
});

module.exports = QuizAnswer;
