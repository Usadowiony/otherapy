import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TherapistList.css';

function TherapistList() {
  const [therapists, setTherapists] = useState([]);
  const [tags, setTags] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

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

  const handleEdit = (id) => {
    setEditingId(id);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleSave = async (id, formData, selectedTags) => {
    try {
      // Aktualizuj dane terapeuty
      await axios.put(`http://localhost:3001/therapists/${id}`, formData);

      // Pobierz aktualne tagi terapeuty
      const therapist = therapists.find(t => t.id === id);
      const currentTags = therapist.Tags ? therapist.Tags.map(tag => tag.id) : [];
      
      // Usuń tagi, które zostały odznaczone
      const tagsToRemove = currentTags.filter(tagId => !selectedTags.includes(tagId));
      await Promise.all(
        tagsToRemove.map(tagId =>
          axios.delete(`http://localhost:3001/therapists/${id}/tags/${tagId}`)
        )
      );

      // Dodaj nowe tagi
      const tagsToAdd = selectedTags.filter(tagId => !currentTags.includes(tagId));
      await Promise.all(
        tagsToAdd.map(tagId =>
          axios.post(`http://localhost:3001/therapists/${id}/tags`, { tagId })
        )
      );

      setEditingId(null);
      fetchTherapists();
    } catch (err) {
      setError('Błąd podczas aktualizacji terapeuty: ' + (err.response?.data?.message || err.message));
    }
  };

  const TherapistCard = ({ therapist }) => {
    const [formData, setFormData] = useState({
      firstName: therapist.firstName,
      lastName: therapist.lastName,
      specialization: therapist.specialization,
      description: therapist.description || ''
    });
    const [selectedTags, setSelectedTags] = useState(
      therapist.Tags ? therapist.Tags.map(tag => tag.id) : []
    );

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleTagToggle = (tagId) => {
      setSelectedTags(prev => {
        if (prev.includes(tagId)) {
          return prev.filter(id => id !== tagId);
        } else {
          return [...prev, tagId];
        }
      });
    };

    if (editingId === therapist.id) {
      return (
        <div className="therapist-card editing">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSave(therapist.id, formData, selectedTags);
          }}>
            <div className="form-group">
              <label htmlFor={`firstName-${therapist.id}`}>Imię:</label>
              <input
                type="text"
                id={`firstName-${therapist.id}`}
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor={`lastName-${therapist.id}`}>Nazwisko:</label>
              <input
                type="text"
                id={`lastName-${therapist.id}`}
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor={`specialization-${therapist.id}`}>Specjalizacja:</label>
              <input
                type="text"
                id={`specialization-${therapist.id}`}
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor={`description-${therapist.id}`}>Opis:</label>
              <textarea
                id={`description-${therapist.id}`}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Tagi:</label>
              <div className="tags-selection">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    className={`tag-button ${selectedTags.includes(tag.id) ? 'selected' : ''}`}
                    onClick={() => handleTagToggle(tag.id)}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="button-group">
              <button type="submit" className="save-button">Zapisz</button>
              <button type="button" className="cancel-button" onClick={handleCancel}>Anuluj</button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <div className="therapist-card">
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
              </span>
            ))}
          </div>
        </div>

        <div className="button-group">
          <button 
            className="edit-button"
            onClick={() => handleEdit(therapist.id)}
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
    );
  };

  return (
    <div className="therapist-list">
      <h2>Lista Terapeutów</h2>
      {error && <div className="error">{error}</div>}
      
      {therapists.map(therapist => (
        <TherapistCard key={therapist.id} therapist={therapist} />
      ))}
    </div>
  );
}

export default TherapistList;
