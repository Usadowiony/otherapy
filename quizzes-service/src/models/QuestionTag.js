const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuestionTag = sequelize.define('QuestionTag', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  QuestionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  TagId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'QuestionTags',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['QuestionId', 'TagId']
    }
  ]
});

module.exports = QuestionTag;
