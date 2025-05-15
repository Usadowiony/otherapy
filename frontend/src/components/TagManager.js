import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TagManager.css';

function TagManager() {
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

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;

    try {
      const response = await axios.post('http://localhost:3001/tags', {
        name: newTag.trim()
      });
      setTags([...tags, response.data]);
      setNewTag('');
      setError(null);
    } catch (err) {
      setError('Błąd podczas dodawania tagu');
    }
  };

  return (
    <div className="tag-manager">
      <h2>Zarządzanie Tagami</h2>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleAddTag} className="add-tag-form">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Nazwa nowego tagu"
          required
        />
        <button type="submit">Dodaj Tag</button>
      </form>

      <div className="tags-list">
        {tags.map(tag => (
          <div key={tag.id} className="tag-item">
            {tag.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TagManager;
