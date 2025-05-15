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

// DELETE /tags/:id - usuń tag
router.delete('/:id', async (req, res) => {
  try {
    const tagId = req.params.id;
    
    // Najpierw sprawdź, czy tag jest używany przez jakichś terapeutów
    const therapistsWithTag = await Therapist.findAll({
      include: [{
        model: Tag,
        where: { id: tagId }
      }]
    });

    if (therapistsWithTag.length > 0) {
      return res.status(400).json({
        message: 'Nie można usunąć tagu, ponieważ jest używany przez terapeutów'
      });
    }

    // Jeśli tag nie jest używany, usuń go
    await Tag.destroy({
      where: { id: tagId }
    });

    res.status(200).json({ message: 'Tag został usunięty' });
  } catch (error) {
    console.error('Błąd podczas usuwania tagu:', error);
    res.status(500).json({
      message: 'Wystąpił błąd podczas usuwania tagu',
      error: error.message
    });
  }
});

module.exports = router;
