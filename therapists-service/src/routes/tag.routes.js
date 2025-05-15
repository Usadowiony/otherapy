const express = require('express');
const router = express.Router();
const Tag = require('../models/tag.model');
const Therapist = require('../models/therapist.model');

// GET /tags - pobierz wszystkie tagi
router.get('/', async (req, res) => {
  try {
    const tags = await Tag.findAll();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'Błąd podczas pobierania tagów' });
  }
});

// POST /tags - dodaj nowy tag
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const tag = await Tag.create({ name });
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ error: 'Błąd podczas dodawania tagu' });
  }
});

// POST /tags/:tagId/therapists/:therapistId - dodaj tag do terapeuty
router.post('/:tagId/therapists/:therapistId', async (req, res) => {
  try {
    const { tagId, therapistId } = req.params;
    const therapist = await Therapist.findByPk(therapistId);
    const tag = await Tag.findByPk(tagId);
    
    if (!therapist || !tag) {
      return res.status(404).json({ error: 'Terapeuta lub tag nie znaleziony' });
    }

    await therapist.addTag(tag);
    res.status(200).json({ message: 'Tag dodany do terapeuty' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd podczas dodawania tagu do terapeuty' });
  }
});

// DELETE /tags/:tagId/therapists/:therapistId - usuń tag z terapeuty
router.delete('/:tagId/therapists/:therapistId', async (req, res) => {
  try {
    const { tagId, therapistId } = req.params;
    const therapist = await Therapist.findByPk(therapistId);
    const tag = await Tag.findByPk(tagId);
    
    if (!therapist || !tag) {
      return res.status(404).json({ error: 'Terapeuta lub tag nie znaleziony' });
    }

    await therapist.removeTag(tag);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Błąd podczas usuwania tagu z terapeuty' });
  }
});

module.exports = router;
