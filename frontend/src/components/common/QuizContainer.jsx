import React from 'react';

const QuizContainer = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default QuizContainer; 