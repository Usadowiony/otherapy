const { Sequelize } = require('sequelize');

// Tworzymy połączenie z bazą SQLite (plik będzie się nazywał therapists.sqlite)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'therapists.sqlite',
  logging: false, // wyłącza logi SQL w konsoli
});

module.exports = sequelize;
