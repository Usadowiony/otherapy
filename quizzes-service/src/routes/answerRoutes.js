const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { Answer } = require('../models');

// Utwórz odpowiedź
router.post('/', [
  body('questionId').isInt(),
  body('text').notEmpty().trim(),
  body('order').isInt(),
  body('tags').optional(),
], async (req, res) => {
  try {
    const answer = await Answer.create(req.body);
    res.status(201).json(answer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Edytuj odpowiedź
router.put('/:id', [
  body('text').optional().trim(),
  body('order').optional().isInt(),
  body('tags').optional(),
], async (req, res) => {
  try {
    const answer = await Answer.findByPk(req.params.id);
    if (!answer) return res.status(404).json({ error: 'Answer not found' });
    await answer.update(req.body);
    res.json(answer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Usuń odpowiedź
router.delete('/:id', async (req, res) => {
  try {
    const answer = await Answer.findByPk(req.params.id);
    if (!answer) return res.status(404).json({ error: 'Answer not found' });
    await answer.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
