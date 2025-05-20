const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TherapistTag = sequelize.define('TherapistTag', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  TherapistId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  TagId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'TherapistTags',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['TherapistId', 'TagId']
    }
  ]
});

module.exports = TherapistTag;