const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const Therapist = require('./models/therapist.model');
const therapistRoutes = require('./routes/therapist.routes');
const tagRoutes = require('./routes/tag.routes');

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint testowy
app.get('/', (req, res) => {
  res.send('Therapists Service działa!');
});

// Dodaj routing terapeutów
app.use('/therapists', therapistRoutes);
app.use('/tags', tagRoutes);

// Synchronizacja bazy i uruchomienie serwera
const PORT = 3001;
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Serwer działa na http://localhost:${PORT}`);
  });
});
