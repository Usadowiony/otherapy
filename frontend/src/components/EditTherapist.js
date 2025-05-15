import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EditTherapist.css';

function EditTherapist({ therapist, onEditComplete, onCancel }) {
  const [formData, setFormData] = useState({
    firstName: therapist.firstName,
    lastName: therapist.lastName,
    specialization: therapist.specialization,
    description: therapist.description || ''
  });
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState(
    therapist.Tags ? therapist.Tags.map(tag => tag.id) : []
  );
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await axios.get('http://localhost:3001/tags');
      setTags(response.data);
    } catch (err) {
      setError('Błąd podczas pobierania tagów');
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Aktualizuj dane terapeuty
      await axios.put(`http://localhost:3001/therapists/${therapist.id}`, formData);

      // Pobierz aktualne tagi terapeuty
      const currentTags = therapist.Tags ? therapist.Tags.map(tag => tag.id) : [];
      
      // Usuń tagi, które zostały odznaczone
      const tagsToRemove = currentTags.filter(tagId => !selectedTags.includes(tagId));
      await Promise.all(
        tagsToRemove.map(tagId =>
          axios.delete(`http://localhost:3001/therapists/${therapist.id}/tags/${tagId}`)
        )
      );

      // Dodaj nowe tagi
      const tagsToAdd = selectedTags.filter(tagId => !currentTags.includes(tagId));
      await Promise.all(
        tagsToAdd.map(tagId =>
          axios.post(`http://localhost:3001/therapists/${therapist.id}/tags`, { tagId })
        )
      );

      if (onEditComplete) {
        onEditComplete();
      }
    } catch (err) {
      setError('Błąd podczas aktualizacji terapeuty: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="edit-therapist">
      <h2>Edytuj Terapeutę</h2>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="firstName">Imię:</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Nazwisko:</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="specialization">Specjalizacja:</label>
          <input
            type="text"
            id="specialization"
            name="specialization"
            value={formData.specialization}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Opis:</label>
          <textarea
            id="description"
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
          <button type="submit" className="save-button">Zapisz zmiany</button>
          <button type="button" className="cancel-button" onClick={onCancel}>Anuluj</button>
        </div>
      </form>
    </div>
  );
}

export default EditTherapist;
