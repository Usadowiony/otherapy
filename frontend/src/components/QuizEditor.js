import React, { useState, useEffect } from 'react';
import axios from 'axios';

function QuizEditor() {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: []
  });

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get('http://localhost:3002/api/quiz');
      if (response.data) {
        setQuiz(response.data);
        setFormData({
          title: response.data.title,
          description: response.data.description,
          questions: response.data.QuizQuestions.map(q => ({
            text: q.question,
            order: q.order,
            answers: q.QuizAnswers.map(a => ({
              text: a.answer,
              order: a.order,
              tagPoints: a.tagPoints
            }))
          }))
        });
      }
      setLoading(false);
    } catch (err) {
      setError('Nie udało się pobrać quizu');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:3002/api/quiz', formData);
      fetchQuiz();
      setError(null);
    } catch (err) {
      setError('Nie udało się zapisać quizu');
    }
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, {
        text: '',
        order: prev.questions.length,
        answers: []
      }]
    }));
  };

  const addAnswer = (questionIndex) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      newQuestions[questionIndex].answers.push({
        text: '',
        order: newQuestions[questionIndex].answers.length,
        tagPoints: {}
      });
      return { ...prev, questions: newQuestions };
    });
  };

  if (loading) return <div>Ładowanie...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="quiz-editor">
      <h2>Edycja Quizu</h2>
      
      <form onSubmit={handleSubmit} className="quiz-form">
        <div className="form-group">
          <label>Tytuł:</label>
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>

        <div className="form-group">
          <label>Opis:</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="questions-section">
          <h3>Pytania</h3>
          {formData.questions.map((question, qIndex) => (
            <div key={qIndex} className="question-group">
              <div className="form-group">
                <label>Pytanie {qIndex + 1}:</label>
                <input
                  type="text"
                  value={question.text}
                  onChange={e => {
                    const newQuestions = [...formData.questions];
                    newQuestions[qIndex].text = e.target.value;
                    setFormData(prev => ({ ...prev, questions: newQuestions }));
                  }}
                  required
                />
              </div>

              <div className="answers-section">
                <h4>Odpowiedzi</h4>
                {question.answers.map((answer, aIndex) => (
                  <div key={aIndex} className="answer-group">
                    <input
                      type="text"
                      value={answer.text}
                      onChange={e => {
                        const newQuestions = [...formData.questions];
                        newQuestions[qIndex].answers[aIndex].text = e.target.value;
                        setFormData(prev => ({ ...prev, questions: newQuestions }));
                      }}
                      placeholder="Treść odpowiedzi"
                      required
                    />
                    <input
                      type="number"
                      value={answer.order}
                      onChange={e => {
                        const newQuestions = [...formData.questions];
                        newQuestions[qIndex].answers[aIndex].order = parseInt(e.target.value);
                        setFormData(prev => ({ ...prev, questions: newQuestions }));
                      }}
                      placeholder="Kolejność"
                      required
                    />
                  </div>
                ))}
                <button type="button" onClick={() => addAnswer(qIndex)}>
                  Dodaj odpowiedź
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addQuestion}>
            Dodaj pytanie
          </button>
        </div>

        <div className="form-actions">
          <button type="submit">Zapisz zmiany</button>
        </div>
      </form>
    </div>
  );
}

export default QuizEditor; 