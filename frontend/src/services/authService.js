// Minimalny serwis do sprawdzania ważności tokenu admina
import axios from 'axios';

const API_URL = 'http://localhost:3002/api/auth/profile';

export const checkAdminToken = async (mode = 'check') => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Brak tokenu');
  try {
    if (mode === 'refresh') {
      // Załóżmy, że endpoint /api/auth/refresh zwraca nowy token
      const res = await axios.post('http://localhost:3002/api/auth/refresh', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        return true;
      }
      throw new Error('Brak nowego tokenu');
    } else {
      await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return true;
    }
  } catch (err) {
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      throw new Error('Token wygasł lub jest nieprawidłowy');
    }
    throw err;
  }
};
