const sequelize = require('../config/database');
const Therapist = require('./Therapist');
const TherapistTag = require('./TherapistTag');

// Usunięto model Tag i relacje z Tag.
// TherapistTag przechowuje tylko powiązania ID terapeuta-tag.

const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    await sequelize.sync();
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  Therapist,
  TherapistTag,
  initDatabase
};