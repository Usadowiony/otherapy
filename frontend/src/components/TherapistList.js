import React, { useState, useEffect, useRef } from 'react';
import axios from '../utils/axios';
import './TherapistList.css';

function TherapistList({ tagsUpdated }) {
  const [therapists, setTherapists] = useState([]);
  const [tags, setTags] = useState([]);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    specialization: '',
    description: '',
    selectedTags: []
  });

  useEffect(() => {
    fetchTherapists();
    fetchTags();
  }, [tagsUpdated]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const cursorPosition = e.target.selectionStart;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      setTimeout(() => {
        const element = document.getElementById(name);
        if (element) {
          element.focus();
          element.setSelectionRange(cursorPosition, cursorPosition);
        }
      }, 0);
      
      return newData;
    });
  };

  const handleTagChange = (tagId) => {
    setFormData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter(id => id !== tagId)
        : [...prev.selectedTags, tagId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/therapists', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        specialization: formData.specialization,
        description: formData.description
      });

      const therapistId = response.data.id;

      // Add selected tags
      if (formData.selectedTags.length > 0) {
        await Promise.all(
          formData.selectedTags.map(tagId =>
            axios.post(`http://localhost:3001/therapists/${therapistId}/tags`, { tagId })
          )
        );
      }

      setFormData({
        firstName: '',
        lastName: '',
        specialization: '',
        description: '',
        selectedTags: []
      });
      setShowAddForm(false);
      fetchTherapists();
    } catch (err) {
      setError('Błąd podczas dodawania terapeuty');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Czy na pewno chcesz usunąć tego terapeutę?')) {
      try {
        await axios.delete(`http://localhost:3001/therapists/${id}`);
        fetchTherapists();
      } catch (err) {
        setError('Błąd podczas usuwania terapeuty');
      }
    }
  };

  const handleEdit = (therapist) => {
    setEditingId(therapist.id);
    setFormData({
      firstName: therapist.firstName,
      lastName: therapist.lastName,
      specialization: therapist.specialization,
      description: therapist.description || '',
      selectedTags: therapist.Tags?.map(tag => tag.id) || []
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3001/therapists/${editingId}`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        specialization: formData.specialization,
        description: formData.description
      });

      // Update tags
      const currentTags = therapists.find(t => t.id === editingId)?.Tags?.map(t => t.id) || [];
      const tagsToAdd = formData.selectedTags.filter(id => !currentTags.includes(id));
      const tagsToRemove = currentTags.filter(id => !formData.selectedTags.includes(id));

      await Promise.all([
        ...tagsToAdd.map(tagId =>
          axios.post(`http://localhost:3001/therapists/${editingId}/tags`, { tagId })
        ),
        ...tagsToRemove.map(tagId =>
          axios.delete(`http://localhost:3001/therapists/${editingId}/tags/${tagId}`)
        )
      ]);

      setEditingId(null);
      setFormData({
        firstName: '',
        lastName: '',
        specialization: '',
        description: '',
        selectedTags: []
      });
      fetchTherapists();
    } catch (err) {
      setError('Błąd podczas aktualizacji terapeuty');
    }
  };

  const TherapistForm = React.memo(({ onSubmit, initialData = formData }) => {
    return (
      <form onSubmit={onSubmit} className="therapist-form">
        <div className="form-group">
          <label htmlFor="firstName">Imię:</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={initialData.firstName}
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
            value={initialData.lastName}
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
            value={initialData.specialization}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Opis:</label>
          <textarea
            id="description"
            name="description"
            value={initialData.description}
            onChange={handleInputChange}
            onSelect={(e) => {
              // Zachowujemy pozycję kursora podczas zaznaczania tekstu
              const cursorPosition = e.target.selectionStart;
              e.target.setSelectionRange(cursorPosition, cursorPosition);
            }}
          />
        </div>
        <div className="form-group">
          <label>Tagi:</label>
          <div className="tags-selection">
            {tags.map(tag => (
              <label key={tag.id} className="tag-checkbox">
                <input
                  type="checkbox"
                  checked={initialData.selectedTags.includes(tag.id)}
                  onChange={() => handleTagChange(tag.id)}
                />
                {tag.name}
              </label>
            ))}
          </div>
        </div>
        <div className="form-buttons">
          <button type="submit" className="submit-button">
            {editingId ? 'Zapisz zmiany' : 'Dodaj terapeutę'}
          </button>
          {editingId && (
            <button
              type="button"
              className="cancel-button"
              onClick={() => {
                setEditingId(null);
                setFormData({
                  firstName: '',
                  lastName: '',
                  specialization: '',
                  description: '',
                  selectedTags: []
                });
              }}
            >
              Anuluj
            </button>
          )}
        </div>
      </form>
    );
  });

  return (
    <div className="therapist-list">
      <div className="therapist-list-header">
        <h2>Lista Terapeutów</h2>
        <button
          className="add-button"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Anuluj' : 'Dodaj Terapeutę'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showAddForm && !editingId && (
        <div className="add-therapist-section">
          <h3>Dodaj Nowego Terapeutę</h3>
          <TherapistForm onSubmit={handleSubmit} />
        </div>
      )}

      <div className="therapists-grid">
        {therapists.map(therapist => (
          <div 
            key={therapist.id} 
            className={`therapist-card ${editingId === therapist.id ? 'editing' : ''}`}
          >
            {editingId === therapist.id ? (
              <TherapistForm onSubmit={handleUpdate} initialData={formData} />
            ) : (
              <>
                <h3>{therapist.firstName} {therapist.lastName}</h3>
                <p><strong>Specjalizacja:</strong> {therapist.specialization}</p>
                {therapist.description && (
                  <p><strong>Opis:</strong> {therapist.description}</p>
                )}
                <div className="therapist-tags">
                  {therapist.Tags?.map(tag => (
                    <span key={tag.id} className="tag">{tag.name}</span>
                  ))}
                </div>
                <div className="therapist-actions">
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
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TherapistList;
