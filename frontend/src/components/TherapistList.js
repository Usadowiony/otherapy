import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TherapistList.css';

function TherapistList() {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const response = await axios.get('http://localhost:3001/therapists');
        setTherapists(response.data);
        setLoading(false);
      } catch (err) {
        setError('Błąd podczas pobierania terapeutów');
        setLoading(false);
      }
    };

    fetchTherapists();
  }, []);

  if (loading) return <div className="loading">Ładowanie...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="therapist-list">
      <h1>Lista Terapeutów</h1>
      <div className="therapist-grid">
        {therapists.map((therapist) => (
          <div key={therapist.id} className="therapist-card">
            <h2>{therapist.firstName} {therapist.lastName}</h2>
            <p className="specialization">{therapist.specialization}</p>
            <p className="description">{therapist.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TherapistList;
