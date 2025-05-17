const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { Question, Answer } = require('../models');

// Pobierz wszystkie pytania dla quizu
router.get('/quiz/:quizId', async (req, res) => {
  try {
    const questions = await Question.findAll({
      where: { quizId: req.params.quizId },
      include: [{
        model: Answer,
        attributes: ['id', 'text', 'isCorrect', 'order']
      }],
      order: [['order', 'ASC']]
    });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pobierz pojedyncze pytanie
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id, {
      include: [{
        model: Answer,
        attributes: ['id', 'text', 'isCorrect', 'order']
      }]
    });
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Utwórz nowe pytanie
router.post('/', [
  body('quizId').isInt(),
  body('text').notEmpty().trim(),
  body('type').isIn(['single', 'multiple', 'text']),
  body('order').isInt()
], async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Aktualizuj pytanie
router.put('/:id', [
  body('text').optional().trim(),
  body('type').optional().isIn(['single', 'multiple', 'text']),
  body('order').optional().isInt()
], async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    await question.update(req.body);
    res.json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Usuń pytanie
router.delete('/:id', async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    await question.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 