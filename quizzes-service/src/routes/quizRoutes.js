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
    // Zakładamy jeden quiz (id=1)
    const quiz = await Quiz.findOne();
    if (!quiz || !quiz.publishedDraftId) {
      return res.json({ questions: [], answers: [] });
    }
    const draft = await QuizDraft.findByPk(quiz.publishedDraftId);
    if (!draft) return res.json({ questions: [], answers: [] });
    const questions = draft.data.questions || [];
    const tagId = req.params.tagId;
    // Szukaj pytań i odpowiedzi z tagiem
    const usedInQuestions = [];
    const usedInAnswers = [];
    questions.forEach((q, qIdx) => {
      if (Array.isArray(q.tags) && q.tags.includes(tagId)) {
        usedInQuestions.push({ qIdx, text: q.text });
      }
      (q.answers || []).forEach((a, aIdx) => {
        if (Array.isArray(a.tags) && a.tags.includes(tagId)) {
          usedInAnswers.push({ qIdx, aIdx, qText: q.text, aText: a.text });
        }
      });
    });
    res.json({ questions: usedInQuestions, answers: usedInAnswers });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Usuwa tag z odpowiedzi (i pytań) we wszystkich draftach quizu (globalnie, bez rozróżniania)
router.delete('/api/tags/:tagId/remove-from-quiz', async (req, res) => {
  try {
    const tagId = req.params.tagId;
    const quiz = await Quiz.findOne();
    if (!quiz) {
      return res.json({ success: true });
    }
    // Usuwamy tag ze wszystkich draftów tego quizu
    const drafts = await QuizDraft.findAll({ where: { quizId: quiz.id } });
    for (const d of drafts) {
      let changed = false;
      const questions = (d.data.questions || []).map(q => {
        let qChanged = false;
        // Usuń tag z pytania
        if (Array.isArray(q.tags) && q.tags.includes(tagId)) {
          q.tags = q.tags.filter(t => t !== tagId);
          qChanged = true;
        }
        // Usuń tag z odpowiedzi
        q.answers = (q.answers || []).map(a => {
          if (Array.isArray(a.tags) && a.tags.includes(tagId)) {
            a.tags = a.tags.filter(t => t !== tagId);
            qChanged = true;
          }
          return a;
        });
        if (qChanged) changed = true;
        return q;
      });
      if (changed) {
        d.data = { ...d.data, questions };
        await d.save();
      }
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;