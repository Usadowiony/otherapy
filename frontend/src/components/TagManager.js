import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TagManager({ onTagsUpdate }) {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/tags', { name: newTag });
      setNewTag('');
      fetchTags();
      onTagsUpdate();
    } catch (err) {
      setError('Błąd podczas dodawania tagu');
    }
  };

  const handleDelete = async (tagId) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten tag? Ta operacja może wpłynąć na powiązanych terapeutów.')) {
      try {
        const response = await axios.delete(`http://localhost:3001/tags/${tagId}`);
        if (response.status === 200) {
          fetchTags();
          onTagsUpdate();
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Błąd podczas usuwania tagu';
        setError(errorMessage);
        
        if (err.response?.status === 400) {
          setError('Nie można usunąć tagu, ponieważ jest nadal używany przez terapeutów. Najpierw usuń tag z profilów terapeutów.');
        }
      }
    }
  };

  return (
    <div className="tag-manager">
      <h2>Zarządzanie Tagami</h2>
      
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="tag-form">
        <div className="form-group">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Nazwa nowego tagu"
            required
          />
          <button type="submit" className="add-button">Dodaj Tag</button>
        </div>
      </form>

      <div className="tags-list">
        {tags.map(tag => (
          <div key={tag.id} className="tag-item">
            <span className="tag-name">{tag.name}</span>
            <button
              className="delete-button"
              onClick={() => handleDelete(tag.id)}
            >
              x
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TagManager;
