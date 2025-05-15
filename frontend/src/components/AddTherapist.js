import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddTherapist.css';

function AddTherapist({ onTherapistAdded }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    specialization: '',
    description: ''
  });
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
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
    const activeElement = document.activeElement;
    const selectionStart = activeElement.selectionStart;
    const selectionEnd = activeElement.selectionEnd;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Przywracamy focus i pozycję kursora
    if (activeElement) {
      activeElement.focus();
      if (activeElement.setSelectionRange) {
        activeElement.setSelectionRange(selectionStart, selectionEnd);
      }
    }
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
      // Najpierw dodaj terapeutę
      const response = await axios.post('http://localhost:3001/therapists', formData);
      const therapistId = response.data.id;

      // Dodaj tylko wybrane tagi
      if (selectedTags.length > 0) {
        try {
          await Promise.all(
            selectedTags.map(tagId => 
              axios.post(`http://localhost:3001/therapists/${therapistId}/tags`, { tagId })
            )
          );
        } catch (tagError) {
          console.error('Błąd podczas dodawania tagów:', tagError);
          // Kontynuuj mimo błędu tagów - terapeuta został już dodany
        }
      }

      // Wyczyść formularz
      setFormData({
        firstName: '',
        lastName: '',
        specialization: '',
        description: ''
      });
      setSelectedTags([]);
      setError(null);

      // Powiadom komponent nadrzędny
      if (onTherapistAdded) {
        onTherapistAdded();
      }
    } catch (err) {
      console.error('Pełny błąd:', err);
      setError('Błąd podczas dodawania terapeuty: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="add-therapist">
      <h2>Dodaj Nowego Terapeutę</h2>
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

        <button type="submit" className="submit-button">Dodaj Terapeutę</button>
      </form>
    </div>
  );
}

export default AddTherapist;
