import React from 'react';
import TherapistList from './components/TherapistList';
import AddTherapist from './components/AddTherapist';
import TagManager from './components/TagManager';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>System Terapeutów</h1>
      </header>
      <main>
        <TagManager />
        <AddTherapist onTherapistAdded={() => {
          // Odśwież listę terapeutów
          window.location.reload();
        }} />
        <TherapistList />
      </main>
    </div>
  );
}

export default App;
