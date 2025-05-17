const express = require('express');
const router = express.Router();
const quizService = require('../services/quiz.service');
const matchingService = require('../services/matching.service');
const { validateQuiz, validateQuizSubmission } = require('../middleware/validation.middleware');

// GET /api/quiz - pobierz quiz
router.get('/', async (req, res, next) => {
  try {
    const quiz = await quizService.getQuiz();
    res.json(quiz);
  } catch (error) {
    next(error);
  }
});

// PUT /api/quiz - aktualizuj quiz
router.put('/', validateQuiz, async (req, res, next) => {
  try {
    const updatedQuiz = await quizService.updateQuiz(req.body);
    res.json(updatedQuiz);
  } catch (error) {
    next(error);
  }
});

// POST /api/quiz/submit - wysłanie odpowiedzi
router.post('/submit', validateQuizSubmission, async (req, res, next) => {
  try {
    const { answers } = req.body;
    const matchedTherapists = await matchingService.findMatchingTherapists(answers);
    res.json({ therapists: matchedTherapists });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
