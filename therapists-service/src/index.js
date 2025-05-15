const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const Therapist = require('./models/therapist.model');
const therapistRoutes = require('./routes/therapist.routes');
const tagRoutes = require('./routes/tag.routes');
const quizRoutes = require('./routes/quiz.routes');

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
app.use('/quiz', quizRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Wystąpił błąd serwera' });
});

// Synchronizacja bazy i uruchomienie serwera
const PORT = process.env.PORT || 3001;
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
