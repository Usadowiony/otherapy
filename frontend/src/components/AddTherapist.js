import React, { useState } from 'react';
import axios from 'axios';
import './AddTherapist.css';

function AddTherapist({ onTherapistAdded }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    specialization: '',
    description: ''
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/therapists', formData);
      onTherapistAdded(response.data);
      // Wyczyść formularz
      setFormData({
        firstName: '',
        lastName: '',
        specialization: '',
        description: ''
      });
      setError(null);
    } catch (err) {
      setError('Błąd podczas dodawania terapeuty');
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
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Opis:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
          />
        </div>
        <button type="submit">Dodaj Terapeutę</button>
      </form>
    </div>
  );
}

export default AddTherapist;
