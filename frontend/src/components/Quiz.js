import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Quiz.css';

function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get('http://localhost:3001/quiz/questions');
      setQuestions(response.data);
    } catch (err) {
      setError('Błąd podczas pobierania pytań');
    }
  };

  const handleAnswer = (answerId) => {
    setAnswers([...answers, answerId]);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    try {
      const response = await axios.post('http://localhost:3001/quiz/match', {
        answers: answers
      });
      setResults(response.data);
    } catch (err) {
      setError('Błąd podczas przetwarzania wyników');
    }
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (results) {
    return (
      <div className="quiz-results">
        <h2>Dopasowani Terapeuci</h2>
        <div className="therapists-list">
          {results.map(therapist => (
            <div key={therapist.id} className="therapist-card">
              <h3>{therapist.firstName} {therapist.lastName}</h3>
              <p><strong>Specjalizacja:</strong> {therapist.specialization}</p>
              {therapist.description && <p><strong>Opis:</strong> {therapist.description}</p>}
              <div className="match-score">
                Dopasowanie: {therapist.matchScore}%
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div>Ładowanie...</div>;
  }

  const question = questions[currentQuestion];

  return (
    <div className="quiz">
      <div className="progress">
        Pytanie {currentQuestion + 1} z {questions.length}
      </div>
      <div className="question-card">
        <h2>{question.question}</h2>
        <div className="answers-list">
          {question.QuizAnswers?.map(answer => (
            <button
              key={answer.id}
              className="answer-button"
              onClick={() => handleAnswer(answer.id)}
            >
              {answer.answer}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Quiz;
