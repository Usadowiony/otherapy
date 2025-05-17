import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TherapistList from './TherapistList';
import TagManager from './TagManager';

function AdminPanel() {
  const navigate = useNavigate();
  const [tagsUpdated, setTagsUpdated] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleTagsUpdate = () => {
    setTagsUpdated(prev => prev + 1);
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
        <section className="therapists-section">
          <h2>Zarządzanie Terapeutami</h2>
          <TherapistList tagsUpdated={tagsUpdated} />
        </section>
        <section className="tags-section">
          <h2>Zarządzanie Tagami</h2>
          <TagManager onTagsUpdate={handleTagsUpdate} />
        </section>
      </div>
    </div>
  );
}

export default AdminPanel;
