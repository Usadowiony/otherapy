const sequelize = require('../config/database');
const Therapist = require('./Therapist');
const Tag = require('./Tag');
const TherapistTag = require('./TherapistTag');

// Definiowanie relacji
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

// Synchronizacja z bazą danych
const initDatabase = async () => {
  try {
    // Testujemy połączenie
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Synchronizujemy modele
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  Therapist,
  Tag,
  TherapistTag,
  initDatabase
}; 