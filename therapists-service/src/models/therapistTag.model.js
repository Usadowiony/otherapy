const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const TherapistTag = sequelize.define('TherapistTag', {
  // Usuwamy te pola, bo Sequelize automatycznie je utworzy
  // therapistId: {
  //   type: DataTypes.INTEGER,
  //   allowNull: false
  // },
  // tagId: {
  //   type: DataTypes.INTEGER,
  //   allowNull: false
  // }
}, {
  tableName: 'therapist_tags',
  timestamps: false
});

module.exports = TherapistTag;
