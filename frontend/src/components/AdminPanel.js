import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TherapistList from './TherapistList';
import TagManager from './TagManager';
import QuizEditor from './QuizEditor';
import './AdminPanel.css';

function AdminPanel() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('therapists');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Panel Administracyjny</h1>
        <button onClick={handleLogout} className="logout-button">
          Wyloguj
        </button>
      </div>
      
      <div className="admin-sections">
        <div className="section-tabs">
          <button 
            className={activeSection === 'therapists' ? 'active' : ''} 
            onClick={() => setActiveSection('therapists')}
          >
            Terapeuci
          </button>
          <button 
            className={activeSection === 'tags' ? 'active' : ''} 
            onClick={() => setActiveSection('tags')}
          >
            Tagi
          </button>
          <button 
            className={activeSection === 'quiz' ? 'active' : ''} 
            onClick={() => setActiveSection('quiz')}
          >
            Quiz
          </button>
        </div>

        <div className="section-content">
          {activeSection === 'therapists' && (
            <section className="therapists-section">
              <h2>Zarządzanie Terapeutami</h2>
              <TherapistList />
            </section>
          )}
          
          {activeSection === 'tags' && (
            <section className="tags-section">
              <h2>Zarządzanie Tagami</h2>
              <TagManager />
            </section>
          )}
          
          {activeSection === 'quiz' && (
            <section className="quiz-section">
              <h2>Edycja Quizu</h2>
              <QuizEditor />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
