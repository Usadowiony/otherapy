import React, { useState } from 'react';
import TherapistList from './TherapistList';
import TagManager from './TagManager';
import QuizManager from './QuizManager';
import './AdminPanel.css';

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('therapists');

  return (
    <div className="admin-panel">
      <nav className="admin-nav">
        <button 
          className={`nav-button ${activeTab === 'therapists' ? 'active' : ''}`}
          onClick={() => setActiveTab('therapists')}
        >
          Terapeuci
        </button>
        <button 
          className={`nav-button ${activeTab === 'tags' ? 'active' : ''}`}
          onClick={() => setActiveTab('tags')}
        >
          Tagi
        </button>
        <button 
          className={`nav-button ${activeTab === 'quiz' ? 'active' : ''}`}
          onClick={() => setActiveTab('quiz')}
        >
          Quiz
        </button>
      </nav>

      <div className="admin-content">
        {activeTab === 'therapists' && <TherapistList />}
        {activeTab === 'tags' && <TagManager />}
        {activeTab === 'quiz' && <QuizManager />}
      </div>
    </div>
  );
}

export default AdminPanel;
