import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Quiz() {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get('http://localhost:3002/api/quiz');
      setQuiz(response.data);
      setLoading(false);
    } catch (err) {
      setError('Nie udało się pobrać quizu');
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerId) => {
    setAnswers(prev => {
      if (prev.includes(answerId)) {
        return prev.filter(id => id !== answerId);
      }
      return [...prev, answerId];
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:3002/api/quiz/submit', { answers });
      setResults(response.data.therapists);
    } catch (err) {
      setError('Nie udało się wysłać odpowiedzi');
    }
  };

  if (loading) return <div className="text-center mt-5">Ładowanie...</div>;
  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;
  if (!quiz) return <div className="text-center mt-5">Quiz nie znaleziony</div>;

  return (
    <div className="quiz-container p-4">
      <h1 className="text-center mb-4">{quiz.title}</h1>
      <p className="text-center mb-4">{quiz.description}</p>

      {!results ? (
        <>
          {quiz.QuizQuestions.map((question) => (
            <div key={question.id} className="form-group">
              <h3 className="mb-3">{question.question}</h3>
              <div className="d-flex flex-column">
                {question.QuizAnswers.map((answer) => (
                  <div key={answer.id} className="form-check mb-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`answer-${answer.id}`}
                      checked={answers.includes(answer.id)}
                      onChange={() => handleAnswerSelect(answer.id)}
                    />
                    <label className="form-check-label" htmlFor={`answer-${answer.id}`}>
                      {answer.answer}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="text-center mt-4">
            <button 
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={answers.length === 0}
            >
              Znajdź terapeutę
            </button>
          </div>
        </>
      ) : (
        <div className="results mt-4">
          <h2 className="text-center mb-4">Dopasowani terapeuci</h2>
          <div className="d-grid gap-3">
            {results.map((therapist) => (
              <div key={therapist.id} className="card p-3">
                <h3>{therapist.name}</h3>
                <p>{therapist.description}</p>
                <div className="d-flex flex-wrap gap-2">
                  {therapist.Tags.map((tag) => (
                    <span key={tag.id} className="badge bg-primary">
                      {tag.name}
                    </span>
                  ))}
                </div>
                <div className="mt-2">
                  <strong>Dopasowanie: {therapist.matchScore}%</strong>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setResults(null);
                setAnswers([]);
              }}
            >
              Spróbuj ponownie
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Quiz;
