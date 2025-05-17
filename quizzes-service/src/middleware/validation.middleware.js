function validateQuiz(req, res, next) {
  const { title, description, questions } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Tytuł quizu jest wymagany'
    });
  }

  if (!Array.isArray(questions)) {
    return res.status(400).json({
      status: 'error',
      message: 'Pytania muszą być tablicą'
    });
  }

  for (const question of questions) {
    if (!question.text || typeof question.text !== 'string' || question.text.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Treść pytania jest wymagana'
      });
    }

    if (!Array.isArray(question.answers)) {
      return res.status(400).json({
        status: 'error',
        message: 'Odpowiedzi muszą być tablicą'
      });
    }

    for (const answer of question.answers) {
      if (!answer.text || typeof answer.text !== 'string' || answer.text.trim().length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Treść odpowiedzi jest wymagana'
        });
      }

      if (!answer.tagPoints || typeof answer.tagPoints !== 'object') {
        return res.status(400).json({
          status: 'error',
          message: 'Punkty tagów są wymagane'
        });
      }
    }
  }

  next();
}

function validateQuizSubmission(req, res, next) {
  const { answers } = req.body;

  if (!Array.isArray(answers)) {
    return res.status(400).json({
      status: 'error',
      message: 'Odpowiedzi muszą być tablicą'
    });
  }

  if (answers.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Wybierz przynajmniej jedną odpowiedź'
    });
  }

  for (const answerId of answers) {
    if (typeof answerId !== 'number' || answerId <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Nieprawidłowy format odpowiedzi'
      });
    }
  }

  next();
}

module.exports = {
  validateQuiz,
  validateQuizSubmission
}; 