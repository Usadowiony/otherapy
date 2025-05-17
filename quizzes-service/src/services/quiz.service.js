const { Quiz, QuizQuestion, QuizAnswer } = require('../models');

class QuizService {
  async getQuiz() {
    let quiz = await Quiz.findOne({
      include: [{
        model: QuizQuestion,
        include: [QuizAnswer]
      }]
    });
    
    if (!quiz) {
      quiz = await this.createDefaultQuiz();
    }
    
    return quiz;
  }

  async createDefaultQuiz() {
    const quiz = await Quiz.create({
      title: 'Quiz dopasowania terapeuty',
      description: 'Odpowiedz na pytania, aby znaleźć najlepiej dopasowanego terapeutę.'
    });

    const question = await QuizQuestion.create({
      quizId: quiz.id,
      question: 'Jakie są Twoje główne problemy?',
      order: 1
    });

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

    return this.getQuizById(quiz.id);
  }

  async getQuizById(id) {
    return Quiz.findOne({
      where: { id },
      include: [{
        model: QuizQuestion,
        include: [QuizAnswer]
      }]
    });
  }

  async updateQuiz(quizData) {
    const { title, description, questions } = quizData;
    
    let quiz = await Quiz.findOne();
    if (!quiz) {
      quiz = await Quiz.create({ title, description });
    } else {
      await quiz.update({ title, description });
    }
    
    await QuizQuestion.destroy({ where: { quizId: quiz.id } });
    
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
    
    return this.getQuizById(quiz.id);
  }
}

module.exports = new QuizService(); 