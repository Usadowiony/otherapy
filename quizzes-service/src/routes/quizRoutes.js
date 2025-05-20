const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { Quiz, QuizDraft } = require('../models');

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

// Zwraca powiązania tagu z opublikowanym quizem (pytania/odpowiedzi)
router.get('/api/tags/:tagId/quiz-usage', async (req, res) => {
  try {
    const { QuestionTag, AnswerTag, Question, Answer, Quiz, QuizDraft } = require('../models');
    const tagId = parseInt(req.params.tagId, 10);
    // Zakładamy jeden quiz (id=1)
    const quiz = await Quiz.findOne();
    if (!quiz || !quiz.publishedDraftId) {
      return res.json({ questions: [], answers: [] });
    }
    // Pobierz pytania i odpowiedzi powiązane z tagiem
    const questionTags = await QuestionTag.findAll({ where: { TagId: tagId } });
    const answerTags = await AnswerTag.findAll({ where: { TagId: tagId } });
    // Pobierz pytania i odpowiedzi (dla czytelności zwracamy teksty)
    const questions = await Question.findAll({ where: { id: questionTags.map(qt => qt.QuestionId) } });
    const answers = await Answer.findAll({ where: { id: answerTags.map(at => at.AnswerId) } });
    // Mapowanie do formatu frontendowego
    const usedInQuestions = questions.map(q => ({ qIdx: q.order, text: q.text }));
    const usedInAnswers = answers.map(a => ({ aIdx: a.order, aText: a.text, qText: null, qIdx: null }));
    // (Opcjonalnie: można dodać powiązanie odpowiedzi z pytaniem, jeśli Answer ma questionId)
    res.json({ questions: usedInQuestions, answers: usedInAnswers });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Usuwa tag z odpowiedzi (i pytań) we wszystkich draftach quizu (globalnie, bez rozróżniania)
router.delete('/api/tags/:tagId/remove-from-quiz', async (req, res) => {
  try {
    const { QuestionTag, AnswerTag, Quiz } = require('../models');
    const tagId = parseInt(req.params.tagId, 10);
    // Pobierz quiz (zakładamy jeden quiz)
    const quiz = await Quiz.findOne();
    if (!quiz) {
      return res.json({ success: true });
    }
    // Usuń powiązania tagu z pytaniami i odpowiedziami
    await QuestionTag.destroy({ where: { TagId: tagId } });
    await AnswerTag.destroy({ where: { TagId: tagId } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;