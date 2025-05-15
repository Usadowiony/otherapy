// frontend/src/components/QuizManager.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './QuizManager.css';

function QuizManager() {
  const [questions, setQuestions] = useState([]);
  const [tags, setTags] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuestions();
    fetchTags();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get('http://localhost:3001/quiz/questions');
      setQuestions(response.data);
    } catch (err) {
      setError('Błąd podczas pobierania pytań');
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get('http://localhost:3001/tags');
      setTags(response.data);
    } catch (err) {
      setError('Błąd podczas pobierania tagów');
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const question = formData.get('question');
    const order = parseInt(formData.get('order'));

    try {
      await axios.post('http://localhost:3001/quiz/questions', {
        question,
        order
      });
      fetchQuestions();
      e.target.reset();
    } catch (err) {
      setError('Błąd podczas dodawania pytania');
    }
  };

  const handleAddAnswer = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const questionId = formData.get('questionId');
    const answer = formData.get('answer');
    const order = parseInt(formData.get('order'));
    const selectedTags = Array.from(formData.getAll('tags')).map(Number);

    try {
      await axios.post(`http://localhost:3001/quiz/questions/${questionId}/answers`, {
        answer,
        order,
        tagIds: selectedTags
      });
      fetchQuestions();
      e.target.reset();
    } catch (err) {
      setError('Błąd podczas dodawania odpowiedzi');
    }
  };

  return (
    <div className="quiz-manager">
      <h2>Zarządzanie Quizem</h2>
      {error && <div className="error">{error}</div>}

      <div className="add-question-section">
        <h3>Dodaj Nowe Pytanie</h3>
        <form onSubmit={handleAddQuestion}>
          <div className="form-group">
            <label htmlFor="question">Pytanie:</label>
            <textarea
              id="question"
              name="question"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="order">Kolejność:</label>
            <input
              type="number"
              id="order"
              name="order"
              required
              min="1"
            />
          </div>
          <button type="submit" className="submit-button">Dodaj Pytanie</button>
        </form>
      </div>

      <div className="questions-list">
        {questions.map(question => (
          <div key={question.id} className="question-card">
            <h3>Pytanie {question.order}: {question.question}</h3>
            
            <div className="add-answer-section">
              <h4>Dodaj Odpowiedź</h4>
              <form onSubmit={handleAddAnswer}>
                <input type="hidden" name="questionId" value={question.id} />
                <div className="form-group">
                  <label htmlFor={`answer-${question.id}`}>Odpowiedź:</label>
                  <input
                    type="text"
                    id={`answer-${question.id}`}
                    name="answer"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`order-${question.id}`}>Kolejność:</label>
                  <input
                    type="number"
                    id={`order-${question.id}`}
                    name="order"
                    required
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Tagi:</label>
                  <div className="tags-selection">
                    {tags.map(tag => (
                      <label key={tag.id} className="tag-checkbox">
                        <input
                          type="checkbox"
                          name="tags"
                          value={tag.id}
                        />
                        {tag.name}
                      </label>
                    ))}
                  </div>
                </div>
                <button type="submit" className="submit-button">Dodaj Odpowiedź</button>
              </form>
            </div>

            <div className="answers-list">
              {question.QuizAnswers?.map(answer => (
                <div key={answer.id} className="answer-item">
                  <span>{answer.answer}</span>
                  <div className="answer-tags">
                    {answer.Tags?.map(tag => (
                      <span key={tag.id} className="tag">{tag.name}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuizManager;