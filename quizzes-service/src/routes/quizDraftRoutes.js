const express = require('express');
const router = express.Router();
const { QuizDraft } = require('../models');
const { Op } = require('sequelize');

// Zapisz nowy draft
router.post('/:quizId', async (req, res) => {
  const { name, author, questions } = req.body;
  if (!name || !author || !questions) {
    return res.status(400).json({ error: 'Wymagane: name, author, questions' });
  }
  const draft = await QuizDraft.create({ quizId: req.params.quizId, data: { questions }, name, author });
  res.status(201).json(draft);
});

// Pobierz listę draftów (najnowsze pierwsze)
router.get('/:quizId', async (req, res) => {
  const drafts = await QuizDraft.findAll({
    where: { quizId: req.params.quizId },
    order: [['createdAt', 'DESC']]
  });
  res.json(drafts);
});

// Pobierz pojedynczy draft
router.get('/:quizId/:draftId', async (req, res) => {
  const draft = await QuizDraft.findOne({ where: { id: req.params.draftId, quizId: req.params.quizId } });
  if (!draft) return res.status(404).json({ error: 'Draft not found' });
  res.json(draft);
});

// PUT: aktualizuj istniejący draft
router.put('/:quizId/:draftId', async (req, res) => {
  const { name, author, questions } = req.body;
  if (!name || !author || !questions) {
    return res.status(400).json({ error: 'Wymagane: name, author, questions' });
  }
  const draft = await QuizDraft.findOne({ where: { id: req.params.draftId, quizId: req.params.quizId } });
  if (!draft) return res.status(404).json({ error: 'Draft not found' });
  draft.name = name;
  draft.author = author;
  draft.data = { questions };
  await draft.save();
  res.json(draft);
});

// Usuń draft (zabezpieczenie przed usunięciem używanego)
router.delete('/:quizId/:draftId', async (req, res) => {
  const { quizId, draftId } = req.params;
  const draft = await QuizDraft.findOne({ where: { id: draftId, quizId } });
  if (!draft) return res.status(404).json({ error: 'Draft not found' });

  // Sprawdź, czy draft jest opublikowany
  const { Quiz } = require('../models');
  const quiz = await Quiz.findByPk(quizId);
  if (quiz && quiz.publishedDraftId === parseInt(draftId, 10)) {
    return res.status(400).json({ error: 'Nie można usunąć opublikowanej wersji roboczej.' });
  }

  await draft.destroy();
  res.json({ success: true });
});

module.exports = router;
