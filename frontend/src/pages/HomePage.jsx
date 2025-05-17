import React, { useState } from 'react';
import QuizContainer from '../components/common/QuizContainer';
import Welcome from '../components/quiz/Welcome';

const HomePage = () => {
  const [currentStep, setCurrentStep] = useState('welcome');

  const handleStart = () => {
    setCurrentStep('quiz'); // To będzie obsługiwane później
  };

  return (
    <QuizContainer>
      <Welcome onStart={handleStart} />
    </QuizContainer>
  );
};

export default HomePage;
