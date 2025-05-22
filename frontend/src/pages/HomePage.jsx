import React, { useState } from 'react';
import { QuizOuterContainer, QuizInnerContainer, WelcomeContainer } from '../components/common/QuizContainer';
import Welcome from '../components/quiz/Welcome';
import { getAllQuizzes } from '../services/quizService';
import { getQuizDraft } from '../services/quizDraftService';

const HomePage = () => {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async () => {
    setLoading(true);
    setError('');
    try {
      const quizzes = await getAllQuizzes();
      const publishedQuiz = quizzes.find(q => q.publishedDraftId);
      if (!publishedQuiz) throw new Error('Brak opublikowanego quizu.');
      const draft = await getQuizDraft(publishedQuiz.id, publishedQuiz.publishedDraftId);
      if (!draft || !draft.data || !Array.isArray(draft.data.questions)) throw new Error('Brak pytań w quizie.');
      setQuestions(draft.data.questions);
      setAnswers(Array(draft.data.questions.length).fill(null));
      setCurrentQuestion(0);
      setCurrentStep('quiz');
    } catch (e) {
      setError(e.message || 'Błąd podczas ładowania quizu');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (answerIdx) => {
    setAnswers(prev => prev.map((a, i) => i === currentQuestion ? answerIdx : a));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(q => q + 1);
    } else {
      setCurrentStep('summary');
    }
  };

  if (currentStep === 'welcome') {
    return (
      <QuizOuterContainer>
        <WelcomeContainer>
          <Welcome onStart={handleStart} />
          {loading && <div className="mt-8 text-center text-blue-600">Ładowanie quizu...</div>}
          {error && <div className="mt-8 text-center text-red-600">{error}</div>}
        </WelcomeContainer>
      </QuizOuterContainer>
    );
  }

  if (currentStep === 'quiz' && questions.length > 0) {
    const q = questions[currentQuestion];
    return (
      <QuizOuterContainer>
        <QuizInnerContainer>
          <div className="p-6">
            <div className="mb-6">
              <div className="text-lg font-semibold mb-2">Pytanie {currentQuestion + 1} z {questions.length}</div>
              <div className="text-2xl font-bold mb-4">{q.text}</div>
            </div>
            <div className="space-y-3 mb-8">
              {q.answers.map((a, idx) => (
                <label key={idx} className={`block border rounded-lg px-4 py-3 cursor-pointer transition-colors ${answers[currentQuestion] === idx ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}>
                  <input
                    type="radio"
                    name={`answer-${currentQuestion}`}
                    checked={answers[currentQuestion] === idx}
                    onChange={() => handleSelectAnswer(idx)}
                    className="mr-2 accent-blue-600"
                  />
                  {a.text}
                </label>
              ))}
            </div>
            <div className="flex justify-between">
              {currentQuestion > 0 ? (
                <button
                  onClick={() => setCurrentQuestion(q => q - 1)}
                  className="px-6 py-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400"
                >
                  Wróć
                </button>
              ) : <div />}
              <button
                onClick={handleNext}
                disabled={answers[currentQuestion] === null}
                className={`px-6 py-2 rounded-lg text-white ${answers[currentQuestion] === null ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {currentQuestion === questions.length - 1 ? 'Podsumuj wynik' : 'Dalej'}
              </button>
            </div>
          </div>
        </QuizInnerContainer>
      </QuizOuterContainer>
    );
  }

  if (currentStep === 'summary') {
    return (
      <QuizOuterContainer>
        <QuizInnerContainer>
          <div className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Gratulacje!</h2>
            <p className="text-lg text-gray-700">Ukończyłeś quiz. Wynik i rekomendacje pojawią się tutaj w przyszłości.</p>
          </div>
        </QuizInnerContainer>
      </QuizOuterContainer>
    );
  }

  return null;
};

export default HomePage;
