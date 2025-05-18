import axios from 'axios';

const API_URL = 'http://localhost:3003/api';

// Konfiguracja axios z tokenem
const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Brak tokenu autoryzacyjnego. Zaloguj się ponownie.');
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Obsługa błędów
const handleError = (error) => {
  if (error.response) {
    // Serwer odpowiedział z kodem błędu
    throw new Error(error.response.data.message || 'Wystąpił błąd serwera');
  } else if (error.request) {
    // Nie otrzymano odpowiedzi
    throw new Error('Nie można połączyć się z serwerem. Sprawdź połączenie internetowe.');
  } else {
    // Błąd podczas konfiguracji żądania
    throw new Error(error.message || 'Wystąpił nieoczekiwany błąd');
  }
};

// Pobierz wszystkie tagi
export const getAllTags = async () => {
  try {
    const response = await axios.get(`${API_URL}/tags`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Pobierz terapeutów używających tagu
export const getTherapistsUsingTag = async (tagId) => {
  try {
    const response = await axios.get(`${API_URL}/tags/${tagId}/therapists`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Utwórz nowy tag
export const createTag = async (tagData) => {
  try {
    const response = await axios.post(
      `${API_URL}/tags`,
      tagData,
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Aktualizuj tag
export const updateTag = async (id, tagData) => {
  try {
    const response = await axios.put(
      `${API_URL}/tags/${id}`,
      tagData,
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Usuń tag
export const deleteTag = async (id) => {
  try {
    const response = await axios.delete(
      `${API_URL}/tags/${id}`,
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
}; 