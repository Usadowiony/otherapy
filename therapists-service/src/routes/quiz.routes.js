const express = require('express');
const router = express.Router();
const QuizQuestion = require('../models/quizQuestion.model');
const QuizAnswer = require('../models/quizAnswer.model');
const Tag = require('../models/tag.model');
const Therapist = require('../models/therapist.model');

// Pobierz wszystkie pytania z odpowiedziami
router.get('/questions', async (req, res) => {
  try {
    const questions = await QuizQuestion.findAll({
      include: [{
        model: QuizAnswer,
        include: [Tag]
      }],
      order: [['order', 'ASC'], [QuizAnswer, 'order', 'ASC']]
    });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Dodaj nowe pytanie
router.post('/questions', async (req, res) => {
  try {
    const { question, order, answers } = req.body;
    const newQuestion = await QuizQuestion.create({ question, order });
    
    if (answers && answers.length > 0) {
      for (const answer of answers) {
        await QuizAnswer.create({
          ...answer,
          QuizQuestionId: newQuestion.id
        });
      }
    }
    
    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Dodaj odpowiedź do pytania
router.post('/questions/:questionId/answers', async (req, res) => {
  try {
    const { questionId } = req.params;
    const { answer, order, tagIds } = req.body;
    
    const newAnswer = await QuizAnswer.create({
      answer,
      order,
      QuizQuestionId: questionId
    });
    
    if (tagIds && tagIds.length > 0) {
      await newAnswer.setTags(tagIds);
    }
    
    res.status(201).json(newAnswer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Dopasuj terapeutów na podstawie odpowiedzi
router.post('/match', async (req, res) => {
  try {
    const { answers } = req.body; // Array of answer IDs
    
    // Pobierz wszystkie tagi z wybranych odpowiedzi
    const selectedAnswers = await QuizAnswer.findAll({
      where: { id: answers },
      include: [Tag]
    });
    
    // Zbierz wszystkie tagi
    const tags = selectedAnswers.reduce((acc, answer) => {
      return [...acc, ...answer.Tags];
    }, []);
    
    // Znajdź terapeutów z tymi tagami
    const therapists = await Therapist.findAll({
      include: [{
        model: Tag,
        where: {
          id: tags.map(tag => tag.id)
        }
      }]
    });
    
    // Sortuj terapeutów według liczby pasujących tagów
    const scoredTherapists = therapists.map(therapist => {
      const matchingTags = therapist.Tags.filter(tag => 
        tags.some(t => t.id === tag.id)
      );
      return {
        ...therapist.toJSON(),
        matchScore: matchingTags.length
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
    
    res.json(scoredTherapists);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
