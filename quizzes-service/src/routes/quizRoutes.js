const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { Quiz, QuizDraft } = require('../models');

// Pobierz wszystkie quizy (tylko metadane, bez pytań)
router.get('/', async (req, res) => {
  try {
    let quizzes = await Quiz.findAll();
    if (!quizzes.length) {
      // Jeśli nie ma quizu, utwórz domyślny quiz
      const quiz = await Quiz.create({
        title: 'Quiz psychologiczny',
        description: 'Quiz do dopasowywania terapeutów na podstawie odpowiedzi.'
      });
      quizzes = [quiz];
    }
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

// Zwraca powiązania tagu z quizem (pytania/odpowiedzi) – opublikowany quiz i drafty!
router.get('/api/tags/:tagId/quiz-usage', async (req, res) => {
  try {
    const { QuestionTag, AnswerTag, Question, Answer, Quiz, QuizDraft } = require('../models');
    const tagId = parseInt(req.params.tagId, 10);
    // Opublikowany quiz
    const quiz = await Quiz.findOne();
    let usedInQuestions = [];
    let usedInAnswers = [];
    if (quiz && quiz.publishedDraftId) {
      const questionTags = await QuestionTag.findAll({ where: { TagId: tagId } });
      const answerTags = await AnswerTag.findAll({ where: { TagId: tagId } });
      const questions = await Question.findAll({ where: { id: questionTags.map(qt => qt.QuestionId) } });
      const answers = await Answer.findAll({ where: { id: answerTags.map(at => at.AnswerId) } });
      usedInQuestions = questions.map(q => ({ qIdx: q.order, text: q.text }));
      usedInAnswers = answers.map(a => ({ aIdx: a.order, aText: a.text, qText: null, qIdx: null }));
    }
    // Drafty quizu
    const drafts = await QuizDraft.findAll();
    for (const draft of drafts) {
      const data = draft.data;
      if (data && Array.isArray(data.questions)) {
        for (const q of data.questions) {
          if (Array.isArray(q.tags) && q.tags.includes(tagId)) {
            usedInQuestions.push({ qIdx: q.order, text: q.text + ' (DRAFT)' });
          }
          if (Array.isArray(q.answers)) {
            for (const a of q.answers) {
              if (Array.isArray(a.tags) && a.tags.includes(tagId)) {
                usedInAnswers.push({ aIdx: a.order, aText: a.text + ' (DRAFT)', qText: q.text, qIdx: q.order });
              }
            }
          }
        }
      }
    }
    res.json({ questions: usedInQuestions, answers: usedInAnswers });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Wyłączony endpoint usuwania tagu z quizu
// router.delete('/api/tags/:tagId/remove-from-quiz', async (req, res) => {
//   try {
//     const { QuestionTag, AnswerTag, Quiz, QuizDraft } = require('../models');
//     const tagId = parseInt(req.params.tagId, 10);
//     // Usuń powiązania tagu z pytaniami i odpowiedziami w opublikowanym quizie
//     await QuestionTag.destroy({ where: { TagId: tagId } });
//     await AnswerTag.destroy({ where: { TagId: tagId } });
//     // Usuń powiązania tagu z pytaniami i odpowiedziami w draftach quizu (w polu data)
//     const drafts = await QuizDraft.findAll();
//     for (const draft of drafts) {
//       let changed = false;
//       const data = draft.data;
//       if (data && Array.isArray(data.questions)) {
//         for (const q of data.questions) {
//           if (Array.isArray(q.tags)) {
//             const before = q.tags.length;
//             q.tags = q.tags.filter(tid => tid !== tagId);
//             if (q.tags.length !== before) changed = true;
//           }
//           if (Array.isArray(q.answers)) {
//             for (const a of q.answers) {
//               if (Array.isArray(a.tags)) {
//                 const before = a.tags.length;
//                 a.tags = a.tags.filter(tid => tid !== tagId);
//                 if (a.tags.length !== before) changed = true;
//               }
//             }
//           }
//         }
//       }
//       if (changed) {
//         draft.data = data;
//         await draft.save();
//       }
//     }
//     res.json({ success: true });
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

module.exports = router;