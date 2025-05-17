import React from 'react';

const Welcome = ({ onStart }) => {
  return (
    <>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Witaj w OTherapy
        </h1>
        <p className="text-gray-600">
          System dopasowywania terapeutów do Twoich potrzeb
        </p>
      </div>

      {/* Content */}
      <div className="mt-8 space-y-4">
        <p className="text-gray-700">
          Dzięki naszemu systemowi znajdziesz terapeutę, który najlepiej pasuje do Twoich potrzeb i oczekiwań.
        </p>
        <p className="text-gray-700">
          Wypełnij krótki quiz, a my pomożemy Ci znaleźć odpowiedniego specjalistę.
        </p>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800">
            Quiz zajmie około 5-10 minut. Twoje odpowiedzi pomogą nam lepiej zrozumieć Twoje potrzeby.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={onStart}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Rozpocznij
        </button>
      </div>
    </>
  );
};

export default Welcome; 