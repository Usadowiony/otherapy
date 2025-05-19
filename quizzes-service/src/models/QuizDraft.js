const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuizDraft = sequelize.define('QuizDraft', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quizId: { type: DataTypes.INTEGER, allowNull: false },
  data: { type: DataTypes.JSON, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  author: { type: DataTypes.STRING, allowNull: false },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  updatedAt: false,
  tableName: 'QuizDrafts'
});

module.exports = QuizDraft;
