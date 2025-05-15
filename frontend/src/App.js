import React from 'react';
import TherapistList from './components/TherapistList';
import AddTherapist from './components/AddTherapist';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>System Terapeutów</h1>
      </header>
      <main>
        <AddTherapist onTherapistAdded={(therapist) => {
          // Odśwież listę terapeutów
          window.location.reload();
        }} />
        <TherapistList />
      </main>
    </div>
  );
}

export default App;
