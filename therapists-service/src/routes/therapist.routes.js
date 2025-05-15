const express = require('express');
const router = express.Router();
const Therapist = require('../models/therapist.model');
const Tag = require('../models/tag.model');

// GET /therapists - pobierz wszystkich terapeutów
router.get('/', async (req, res) => {
  try {
    const therapists = await Therapist.findAll({
      include: [{
        model: Tag,
        through: { attributes: [] } // nie zwracaj danych z tabeli pośredniej
      }]
    });
    res.json(therapists);
  } catch (error) {
    res.status(500).json({ error: 'Błąd podczas pobierania terapeutów' });
  }
});

// POST /therapists - dodaj nowego terapeutę
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, specialization, description } = req.body;
    const therapist = await Therapist.create({
      firstName,
      lastName,
      specialization,
      description
    });
    res.status(201).json(therapist);
  } catch (error) {
    res.status(500).json({ error: 'Błąd podczas dodawania terapeuty' });
  }
});

// PUT /therapists/:id - aktualizuj terapeutę
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, specialization, description } = req.body;
    const therapist = await Therapist.findByPk(id);
    
    if (!therapist) {
      return res.status(404).json({ error: 'Terapeuta nie znaleziony' });
    }

    await therapist.update({
      firstName,
      lastName,
      specialization,
      description
    });

    res.json(therapist);
  } catch (error) {
    res.status(500).json({ error: 'Błąd podczas aktualizacji terapeuty' });
  }
});

// DELETE /therapists/:id - usuń terapeutę
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const therapist = await Therapist.findByPk(id);
    
    if (!therapist) {
      return res.status(404).json({ error: 'Terapeuta nie znaleziony' });
    }

    await therapist.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Błąd podczas usuwania terapeuty' });
  }
});

module.exports = router;
