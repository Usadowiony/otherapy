const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { Quiz } = require('../models');

// Pobierz wszystkie quizy (tylko metadane, bez pytań)
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.findAll();
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pobierz pojedynczy quiz (tylko metadane, bez pytań)
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Utwórz nowy quiz
router.post('/', [
  body('title').notEmpty().trim(),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json(quiz);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Aktualizuj quiz (np. publikacja draftu)
router.put('/:id', [
  body('title').optional().trim(),
  body('description').optional().trim(),
  body('isActive').optional().isBoolean(),
  body('publishedDraftId').optional().isInt()
], async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    await quiz.update(req.body);
    res.json(quiz);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Usuń quiz
router.delete('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    await quiz.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;