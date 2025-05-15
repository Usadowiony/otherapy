import React, { useState } from 'react';
import AdminPanel from './components/AdminPanel';
import Quiz from './components/Quiz';
import './App.css';

function App() {
  const [isAdmin, setIsAdmin] = useState(false); // W przyszłości można to połączyć z autentykacją

  return (
    <div className="app">
      <header className="app-header">
        <h1>otherapy</h1>
        <button 
          className="admin-toggle"
          onClick={() => setIsAdmin(!isAdmin)}
        >
          {isAdmin ? 'Przejdź do Quizu' : 'Panel Admina'}
        </button>
      </header>
      <main>
        {isAdmin ? <AdminPanel /> : <Quiz />}
      </main>
    </div>
  );
}

export default App;
