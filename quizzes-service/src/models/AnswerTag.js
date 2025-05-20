const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AnswerTag = sequelize.define('AnswerTag', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  AnswerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  TagId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'AnswerTags',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['AnswerId', 'TagId']
    }
  ]
});

module.exports = AnswerTag;
