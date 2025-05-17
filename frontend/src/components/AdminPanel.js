import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TherapistList from './TherapistList';
import TagManager from './TagManager';
import QuizEditor from './QuizEditor';

function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('quiz');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="admin-panel p-4">
      <div className="d-flex justify-between align-center mb-4">
        <h1>Panel Administracyjny</h1>
        <button className="btn btn-danger" onClick={handleLogout}>
          Wyloguj
        </button>
      </div>
      
      <div className="d-flex justify-center mb-4">
        <div className="btn-group">
          <button 
            className={`btn ${activeTab === 'quiz' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('quiz')}
          >
            Quiz
          </button>
          <button 
            className={`btn ${activeTab === 'tags' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('tags')}
          >
            Tagi
          </button>
          <button 
            className={`btn ${activeTab === 'therapists' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('therapists')}
          >
            Terapeuci
          </button>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'quiz' && <QuizEditor />}
        {activeTab === 'tags' && <TagManager />}
        {activeTab === 'therapists' && <TherapistList />}
      </div>
    </div>
  );
}

export default AdminPanel;
