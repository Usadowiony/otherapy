const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quiz = sequelize.define('Quiz', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  welcomePage: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: 'Witaj w quizie! Kliknij "Rozpocznij", aby przejść do pierwszego pytania.'
  }
});

module.exports = Quiz; 