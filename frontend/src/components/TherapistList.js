import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TherapistList.css';
import EditTherapist from './EditTherapist';

function TherapistList() {
  const [therapists, setTherapists] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [error, setError] = useState(null);
  const [editingTherapist, setEditingTherapist] = useState(null);

  useEffect(() => {
    fetchTherapists();
    fetchTags();
  }, []);

  const fetchTherapists = async () => {
    try {
      const response = await axios.get('http://localhost:3001/therapists');
      setTherapists(response.data);
    } catch (err) {
      setError('Błąd podczas pobierania terapeutów');
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get('http://localhost:3001/tags');
      setTags(response.data);
    } catch (err) {
      setError('Błąd podczas pobierania tagów');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Czy na pewno chcesz usunąć tego terapeutę?')) {
      try {
        await axios.delete(`http://localhost:3001/therapists/${id}`);
        setTherapists(therapists.filter(t => t.id !== id));
      } catch (err) {
        setError('Błąd podczas usuwania terapeuty');
      }
    }
  };

  const handleTagToggle = async (therapistId, tagId) => {
    try {
      const therapist = therapists.find(t => t.id === therapistId);
      const hasTag = therapist.Tags.some(tag => tag.id === tagId);
      
      if (hasTag) {
        await axios.delete(`http://localhost:3001/therapists/${therapistId}/tags/${tagId}`);
      } else {
        await axios.post(`http://localhost:3001/therapists/${therapistId}/tags`, { tagId });
      }
      
      // Odśwież listę terapeutów
      fetchTherapists();
    } catch (err) {
      setError('Błąd podczas aktualizacji tagów');
    }
  };

  const handleEdit = (therapist) => {
    setEditingTherapist(therapist);
  };

  const handleEditComplete = () => {
    setEditingTherapist(null);
    fetchTherapists();
  };

  return (
    <div className="therapist-list">
      <h2>Lista Terapeutów</h2>
      {error && <div className="error">{error}</div>}
      
      {editingTherapist && (
        <EditTherapist
          therapist={editingTherapist}
          onEditComplete={handleEditComplete}
          onCancel={() => setEditingTherapist(null)}
        />
      )}
      
      {therapists.map(therapist => (
        <div key={therapist.id} className="therapist-card">
          <div className="therapist-info">
            <h3>{therapist.firstName} {therapist.lastName}</h3>
            <p><strong>Specjalizacja:</strong> {therapist.specialization}</p>
            {therapist.description && <p><strong>Opis:</strong> {therapist.description}</p>}
          </div>
          
          <div className="therapist-tags">
            <h4>Tagi:</h4>
            <div className="tags-container">
              {therapist.Tags?.map(tag => (
                <span key={tag.id} className="tag">
                  {tag.name}
                  <button 
                    className="remove-tag"
                    onClick={() => handleTagToggle(therapist.id, tag.id)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            
            <div className="available-tags">
              {tags.filter(tag => !therapist.Tags?.some(t => t.id === tag.id))
                .map(tag => (
                  <button
                    key={tag.id}
                    className="add-tag"
                    onClick={() => handleTagToggle(therapist.id, tag.id)}
                  >
                    + {tag.name}
                  </button>
                ))}
            </div>
          </div>

          <div className="button-group">
            <button 
              className="edit-button"
              onClick={() => handleEdit(therapist)}
            >
              Edytuj
            </button>
            <button 
              className="delete-button"
              onClick={() => handleDelete(therapist.id)}
            >
              Usuń
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TherapistList;
