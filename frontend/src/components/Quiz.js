import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import './Quiz.css';

function Quiz() {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get('http://localhost:3002/api/quiz');
      setQuiz(response.data);
      setLoading(false);
    } catch (err) {
      setError('Nie udało się pobrać quizu. Spróbuj ponownie później.');
      setLoading(false);
    }
  };

  const handleAnswer = (answerId) => {
    setAnswers(prev => [...prev, answerId]);
    if (currentQuestion < quiz.QuizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    try {
      const response = await axios.post('http://localhost:3002/api/quiz/submit', {
        answers
      });
      setResults(response.data);
    } catch (err) {
      setError('Wystąpił błąd podczas przetwarzania odpowiedzi.');
    }
  };

  if (loading) {
    return <div className="quiz-loading">Ładowanie quizu...</div>;
  }

  if (error) {
    return <div className="quiz-error">{error}</div>;
  }

  if (!quiz) {
    return <div className="quiz-message">Quiz jest w trakcie przygotowania. Zapraszamy wkrótce!</div>;
  }

  if (results) {
    return (
      <div className="quiz-results">
        <h2>Dopasowani Terapeuci</h2>
        <div className="therapists-list">
          {results.therapists.map(therapist => (
            <div key={therapist.id} className="therapist-card">
              <h3>{therapist.firstName} {therapist.lastName}</h3>
              <p><strong>Specjalizacja:</strong> {therapist.specialization}</p>
              {therapist.description && (
                <p><strong>Opis:</strong> {therapist.description}</p>
              )}
              <div className="match-score">
                Dopasowanie: {therapist.matchScore}%
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const question = quiz.QuizQuestions[currentQuestion];

  return (
    <div className="quiz-container">
      <div className="progress">
        Pytanie {currentQuestion + 1} z {quiz.QuizQuestions.length}
      </div>
      
      <div className="question-card">
        <h2>{question.question}</h2>
        <div className="answers-list">
          {question.QuizAnswers.map(answer => (
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
