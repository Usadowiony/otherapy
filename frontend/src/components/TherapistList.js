import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TherapistList.css';

function TherapistList() {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTherapist, setEditingTherapist] = useState(null);

  useEffect(() => {
    fetchTherapists();
  }, []);

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

  const handleEdit = (therapist) => {
    setEditingTherapist(therapist);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:3001/therapists/${editingTherapist.id}`,
        editingTherapist
      );
      setTherapists(therapists.map(t => 
        t.id === editingTherapist.id ? response.data : t
      ));
      setEditingTherapist(null);
    } catch (err) {
      setError('Błąd podczas aktualizacji terapeuty');
    }
  };

  if (loading) return <div className="loading">Ładowanie...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="therapist-list">
      <h1>Lista Terapeutów</h1>
      <div className="therapist-grid">
        {therapists.map((therapist) => (
          <div key={therapist.id} className="therapist-card">
            {editingTherapist?.id === therapist.id ? (
              <form onSubmit={handleUpdate} className="edit-form">
                <div className="form-group">
                  <label htmlFor="edit-firstName">Imię:</label>
                  <input
                    id="edit-firstName"
                    type="text"
                    value={editingTherapist.firstName}
                    onChange={(e) => setEditingTherapist({
                      ...editingTherapist,
                      firstName: e.target.value
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-lastName">Nazwisko:</label>
                  <input
                    id="edit-lastName"
                    type="text"
                    value={editingTherapist.lastName}
                    onChange={(e) => setEditingTherapist({
                      ...editingTherapist,
                      lastName: e.target.value
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-specialization">Specjalizacja:</label>
                  <input
                    id="edit-specialization"
                    type="text"
                    value={editingTherapist.specialization}
                    onChange={(e) => setEditingTherapist({
                      ...editingTherapist,
                      specialization: e.target.value
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-description">Opis:</label>
                  <textarea
                    id="edit-description"
                    value={editingTherapist.description}
                    onChange={(e) => setEditingTherapist({
                      ...editingTherapist,
                      description: e.target.value
                    })}
                  />
                </div>
                <div className="button-group">
                  <button type="submit">Zapisz</button>
                  <button type="button" onClick={() => setEditingTherapist(null)}>
                    Anuluj
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h2>{therapist.firstName} {therapist.lastName}</h2>
                <p className="specialization">{therapist.specialization}</p>
                <p className="description">{therapist.description}</p>
                <div className="button-group">
                  <button onClick={() => handleEdit(therapist)}>Edytuj</button>
                  <button onClick={() => handleDelete(therapist.id)}>Usuń</button>
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
