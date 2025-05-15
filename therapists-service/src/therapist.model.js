const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Therapist = sequelize.define('Therapist', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'therapists',
  timestamps: false,
});

module.exports = Therapist;
