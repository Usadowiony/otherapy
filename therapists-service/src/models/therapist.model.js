const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Tag = require('./tag.model');
const TherapistTag = require('./therapistTag.model');

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

// Dodaj relacje z jawnym określeniem kluczy obcych
Therapist.belongsToMany(Tag, { 
  through: TherapistTag,
  foreignKey: 'TherapistId',
  otherKey: 'TagId'
});
Tag.belongsToMany(Therapist, { 
  through: TherapistTag,
  foreignKey: 'TagId',
  otherKey: 'TherapistId'
});

module.exports = Therapist;
