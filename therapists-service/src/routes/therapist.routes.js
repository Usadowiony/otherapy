const express = require('express');
const router = express.Router();
const Therapist = require('../therapist.model');

// GET /therapists - pobierz wszystkich terapeutów
router.get('/', async (req, res) => {
  try {
    const therapists = await Therapist.findAll();
    res.json(therapists);
  } catch (error) {
    res.status(500).json({ error: 'Błąd podczas pobierania terapeutów' });
  }
});

module.exports = router;
