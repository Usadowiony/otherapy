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

let globalAuthErrorHandler = null;
export const setGlobalAuthErrorHandler = (handler) => {
  globalAuthErrorHandler = handler;
};

// Obsługa błędów
const handleError = (error) => {
  if (error.response) {
    if (
      error.response.status === 401 ||
      error.response.status === 403 ||
      error.response.data?.message?.toLowerCase().includes('token')
    ) {
      if (globalAuthErrorHandler) globalAuthErrorHandler();
    }
    throw new Error(error.response.data.message || 'Wystąpił błąd serwera');
  } else if (error.request) {
    // Nie otrzymano odpowiedzi
    throw new Error('Nie można połączyć się z serwerem. Sprawdź połączenie internetowe.');
  } else {
    // Błąd podczas konfiguracji żądania
    throw new Error(error.message || 'Wystąpił nieoczekiwany błąd');
  }
};

// Pobierz wszystkich terapeutów
export const getAllTherapists = async () => {
  try {
    const response = await axios.get(`${API_URL}/therapists`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Pobierz pojedynczego terapeutę
export const getTherapistById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/therapists/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Utwórz nowego terapeutę
export const createTherapist = async (therapistData) => {
  try {
    const response = await axios.post(
      `${API_URL}/therapists`,
      therapistData,
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Aktualizuj terapeutę
export const updateTherapist = async (id, therapistData) => {
  try {
    const response = await axios.put(
      `${API_URL}/therapists/${id}`,
      therapistData,
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Usuń terapeutę
export const deleteTherapist = async (id) => {
  try {
    const response = await axios.delete(
      `${API_URL}/therapists/${id}`,
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    handleError(error);
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