const axios = require('axios');
const { Quiz, QuizQuestion, QuizAnswer } = require('../models');

class MatchingService {
  async findMatchingTherapists(answers) {
    const quiz = await Quiz.findOne({
      include: [{
        model: QuizQuestion,
        include: [QuizAnswer]
      }]
    });

    if (!quiz) {
      throw new Error('Quiz nie znaleziony');
    }

    const tagPoints = this.calculateTagPoints(quiz, answers);
    const therapists = await this.fetchTherapists();
    return this.matchTherapists(therapists, tagPoints);
  }

  calculateTagPoints(quiz, answers) {
    const tagPoints = {};
    for (const answerId of answers) {
      const answer = quiz.QuizQuestions.flatMap(q => q.QuizAnswers).find(a => a.id === answerId);
      if (answer) {
        for (const [tag, points] of Object.entries(answer.tagPoints)) {
          tagPoints[tag] = (tagPoints[tag] || 0) + points;
        }
      }
    }
    return tagPoints;
  }

  async fetchTherapists() {
    try {
      const response = await axios.get('http://localhost:3001/therapists');
      return response.data;
    } catch (error) {
      console.error('Błąd podczas pobierania terapeutów:', error);
      throw new Error('Nie udało się pobrać listy terapeutów');
    }
  }

  matchTherapists(therapists, userTagPoints) {
    return therapists
      .map(therapist => {
        const matchScore = this.calculateMatchScore(therapist.Tags, userTagPoints);
        return {
          ...therapist,
          matchScore
        };
      })
      .filter(t => t.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  calculateMatchScore(therapistTags, userTagPoints) {
    let totalScore = 0;
    let maxPossibleScore = 0;

    for (const tag of therapistTags) {
      const points = userTagPoints[tag.id] || 0;
      totalScore += points;
      maxPossibleScore += 100; // Maksymalnie 100 punktów na tag
    }

    return maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
  }
}

module.exports = new MatchingService(); 