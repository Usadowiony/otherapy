const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Therapist = sequelize.define('Therapist', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

// Relacja many-to-many z tagami jest zdefiniowana w osobnym pliku TherapistTag.js
// i jest automatycznie inicjalizowana przez Sequelize

module.exports = Therapist; 