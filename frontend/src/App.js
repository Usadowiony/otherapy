import React from 'react';
import TherapistList from './components/TherapistList';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>System Terapeutów</h1>
      </header>
      <main>
        <TherapistList />
      </main>
    </div>
  );
}

export default App;
