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
  // Walidacja unikalności nazwy draftu dla quizu
  const exists = await QuizDraft.findOne({ where: { quizId: req.params.quizId, name } });
  if (exists) {
    return res.status(409).json({ error: 'Draft o takiej nazwie już istnieje dla tego quizu.' });
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
  // Walidacja unikalności nazwy draftu dla quizu (z wykluczeniem aktualizowanego draftu)
  const exists = await QuizDraft.findOne({
    where: {
      quizId: req.params.quizId,
      name,
      id: { [Op.ne]: req.params.draftId }
    }
  });
  if (exists) {
    return res.status(409).json({ error: 'Draft o takiej nazwie już istnieje dla tego quizu.' });
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

// Dodaj tag do pytania
router.post('/question/:questionId/tag/:tagId', async (req, res) => {
  const { QuestionTag } = require('../models');
  const { questionId, tagId } = req.params;
  try {
    await QuestionTag.findOrCreate({ where: { QuestionId: questionId, TagId: tagId } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Usuń tag z pytania
router.delete('/question/:questionId/tag/:tagId', async (req, res) => {
  const { QuestionTag } = require('../models');
  const { questionId, tagId } = req.params;
  try {
    await QuestionTag.destroy({ where: { QuestionId: questionId, TagId: tagId } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Dodaj tag do odpowiedzi
router.post('/answer/:answerId/tag/:tagId', async (req, res) => {
  const { AnswerTag } = require('../models');
  const { answerId, tagId } = req.params;
  try {
    await AnswerTag.findOrCreate({ where: { AnswerId: answerId, TagId: tagId } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Usuń tag z odpowiedzi
router.delete('/answer/:answerId/tag/:tagId', async (req, res) => {
  const { AnswerTag } = require('../models');
  const { answerId, tagId } = req.params;
  try {
    await AnswerTag.destroy({ where: { AnswerId: answerId, TagId: tagId } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
