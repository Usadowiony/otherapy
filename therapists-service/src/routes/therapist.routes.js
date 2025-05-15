const express = require('express');
const router = express.Router();
const Therapist = require('../models/therapist.model');
const Tag = require('../models/tag.model');

// GET /therapists - pobierz wszystkich terapeutów
router.get('/', async (req, res) => {
  try {
    const therapists = await Therapist.findAll({
      include: [Tag]
    });
    res.json(therapists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /therapists - dodaj nowego terapeutę
router.post('/', async (req, res) => {
  try {
    const therapist = await Therapist.create(req.body);
    res.status(201).json(therapist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Dodaj tag do terapeuty
router.post('/:therapistId/tags', async (req, res) => {
  try {
    const { therapistId } = req.params;
    const { tagId } = req.body;

    const therapist = await Therapist.findByPk(therapistId);
    if (!therapist) {
      return res.status(404).json({ message: 'Terapeuta nie znaleziony' });
    }

    const tag = await Tag.findByPk(tagId);
    if (!tag) {
      return res.status(404).json({ message: 'Tag nie znaleziony' });
    }

    await therapist.addTag(tag);
    res.status(200).json({ message: 'Tag dodany pomyślnie' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Usuń tag z terapeuty
router.delete('/:therapistId/tags/:tagId', async (req, res) => {
  try {
    const { therapistId, tagId } = req.params;

    const therapist = await Therapist.findByPk(therapistId);
    if (!therapist) {
      return res.status(404).json({ message: 'Terapeuta nie znaleziony' });
    }

    const tag = await Tag.findByPk(tagId);
    if (!tag) {
      return res.status(404).json({ message: 'Tag nie znaleziony' });
    }

    await therapist.removeTag(tag);
    res.status(200).json({ message: 'Tag usunięty pomyślnie' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /therapists/:id - aktualizuj terapeutę
router.put('/:id', async (req, res) => {
  try {
    const therapist = await Therapist.findByPk(req.params.id);
    if (!therapist) {
      return res.status(404).json({ message: 'Terapeuta nie znaleziony' });
    }
    await therapist.update(req.body);
    res.json(therapist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /therapists/:id - usuń terapeutę
router.delete('/:id', async (req, res) => {
  try {
    const therapist = await Therapist.findByPk(req.params.id);
    if (!therapist) {
      return res.status(404).json({ message: 'Terapeuta nie znaleziony' });
    }
    await therapist.destroy();
    res.json({ message: 'Terapeuta usunięty pomyślnie' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
