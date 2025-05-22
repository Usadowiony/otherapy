import React from 'react';

// Kontener quizu, który NIE ogranicza szerokości dzieci
export const QuizOuterContainer = ({ children }) => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
    {children}
  </div>
);

// Kontener do quizu (pytania, podsumowanie) - szeroki
export const QuizInnerContainer = ({ children }) => (
  <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-hidden">
    {children}
  </div>
);

// Kontener do strony powitalnej - węższy
export const WelcomeContainer = ({ children }) => (
  <div className="w-full max-w-xl bg-white rounded-xl shadow-md px-6 py-10 mx-auto">
    {children}
  </div>
);

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