const express = require('express');
const router = express.Router();
const { Quiz, QuizQuestion, QuizAnswer } = require('../models');
const axios = require('axios');
const sequelize = require('../config/database');

// GET /api/quiz - pobierz quiz
router.get('/', async (req, res) => {
  try {
    let quiz = await Quiz.findOne({
      include: [{
        model: QuizQuestion,
        include: [QuizAnswer]
      }]
    });
    
    if (!quiz) {
      console.log('Tworzenie nowego quizu...');
      // Jeśli nie ma quizu, stwórz domyślny
      quiz = await Quiz.create({
        title: 'Quiz dopasowania terapeuty',
        description: 'Odpowiedz na pytania, aby znaleźć najlepiej dopasowanego terapeutę.'
      });

      // Dodaj przykładowe pytanie
      const question = await QuizQuestion.create({
        quizId: quiz.id,
        question: 'Jakie są Twoje główne problemy?',
        order: 1
      });

      // Dodaj przykładowe odpowiedzi
      await QuizAnswer.create({
        questionId: question.id,
        answer: 'Lęk i niepokój',
        order: 1,
        tagPoints: { "1": 80 }
      });

      await QuizAnswer.create({
        questionId: question.id,
        answer: 'Depresja',
        order: 2,
        tagPoints: { "2": 80 }
      });

      // Pobierz świeżo utworzony quiz z relacjami
      quiz = await Quiz.findOne({
        where: { id: quiz.id },
        include: [{
          model: QuizQuestion,
          include: [QuizAnswer]
        }]
      });
    }
    
    res.json(quiz);
  } catch (error) {
    console.error('Błąd podczas pobierania/tworzenia quizu:', error);
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/quiz - aktualizuj quiz
router.put('/', async (req, res) => {
  try {
    const { title, description, questions } = req.body;
    
    // Znajdź istniejący quiz lub stwórz nowy
    let quiz = await Quiz.findOne();
    if (!quiz) {
      quiz = await Quiz.create({ title, description });
    } else {
      await quiz.update({ title, description });
    }
    
    // Usuń stare pytania i odpowiedzi
    await QuizQuestion.destroy({ where: { quizId: quiz.id } });
    
    // Dodaj nowe pytania i odpowiedzi
    for (const question of questions) {
      const createdQuestion = await QuizQuestion.create({
        quizId: quiz.id,
        question: question.text,
        order: question.order
      });
      
      for (const answer of question.answers) {
        await QuizAnswer.create({
          questionId: createdQuestion.id,
          answer: answer.text,
          order: answer.order,
          tagPoints: answer.tagPoints
        });
      }
    }
    
    // Pobierz zaktualizowany quiz
    const updatedQuiz = await Quiz.findOne({
      where: { id: quiz.id },
      include: [{
        model: QuizQuestion,
        include: [QuizAnswer]
      }]
    });
    
    res.json(updatedQuiz);
  } catch (error) {
    console.error('Błąd podczas aktualizacji quizu:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/quiz/submit - wysłanie odpowiedzi
router.post('/submit', async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findOne({
      include: [{
        model: QuizQuestion,
        include: [QuizAnswer]
      }]
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz nie znaleziony' });
    }

    // Obliczanie punktów dla tagów
    const tagPoints = {};
    for (const answerId of answers) {
      const answer = quiz.QuizQuestions.flatMap(q => q.QuizAnswers).find(a => a.id === answerId);
      if (answer) {
        for (const [tag, points] of Object.entries(answer.tagPoints)) {
          tagPoints[tag] = (tagPoints[tag] || 0) + points;
        }
      }
    }

    // Pobieranie terapeutów z therapists-service
    const therapistsResponse = await axios.get('http://localhost:3001/therapists');
    const therapists = therapistsResponse.data;

    // Dopasowywanie terapeutów
    const matchedTherapists = therapists.map(therapist => {
      const matchScore = calculateMatchScore(therapist.Tags, tagPoints);
      return {
        ...therapist,
        matchScore
      };
    }).filter(t => t.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json({ therapists: matchedTherapists });
  } catch (error) {
    console.error('Błąd podczas przetwarzania odpowiedzi:', error);
    res.status(500).json({ message: error.message });
  }
});

// Funkcja pomocnicza do obliczania dopasowania
function calculateMatchScore(therapistTags, userTagPoints) {
  let totalScore = 0;
  let maxPossibleScore = 0;

  for (const tag of therapistTags) {
    const points = userTagPoints[tag.id] || 0;
    totalScore += points;
    maxPossibleScore += 100; // Maksymalnie 100 punktów na tag
  }

  return maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
}

module.exports = router;
