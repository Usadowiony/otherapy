import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
        <h1 className="text-5xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Nie znaleziono strony</h2>
        <p className="text-gray-600 mb-8">Podany adres nie istnieje lub został usunięty.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold shadow"
        >
          Wróć do strony głównej
        </button>
      </div>
    </div>
  );
};

export default NotFound;
