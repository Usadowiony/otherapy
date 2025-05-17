import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      navigate('/admin'); // Przekierowanie do panelu admina
    } catch (err) {
      setError('Nieprawidłowe dane logowania');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Logowanie Administratora</h2>
        {error && <div className="error">{error}</div>}
        <div className="form-group">
          <input
            type="text"
            placeholder="Nazwa użytkownika"
            value={credentials.username}
            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Hasło"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
          />
        </div>
        <button type="submit">Zaloguj</button>
      </form>
    </div>
  );
}

export default Login;
