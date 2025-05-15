const express = require('express');
const sequelize = require('./db');
const Therapist = require('./therapist.model');

const app = express();
app.use(express.json());

// Endpoint testowy
app.get('/', (req, res) => {
  res.send('Therapists Service działa!');
});

// Synchronizacja bazy i uruchomienie serwera
const PORT = 3001;
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Serwer działa na http://localhost:${PORT}`);
  });
});
