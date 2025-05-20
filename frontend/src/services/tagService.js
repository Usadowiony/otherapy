import axios from 'axios';
import { useAdminAuth } from '../components/admin/AdminAuthProvider';

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

// Globalny handler błędów autoryzacji
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
      `${API_URL}/admin/tags`, // poprawiony endpoint
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
      `${API_URL}/admin/tags/${id}`,
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

// Kaskadowo usuń powiązania tagu z terapeutami
export const removeTagFromAllTherapists = async (tagId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/tags/${tagId}/remove-from-therapists`,
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Pobierz powiązania tagu z quizem (pytania/odpowiedzi)
export const getQuizTagUsage = async (tagId) => {
  try {
    const response = await axios.get('http://localhost:3004/api/tags/' + tagId + '/quiz-usage');
    return response.data;
  } catch (error) {
    // Jeśli 404/410, traktuj jako brak powiązań
    if (error.response && (error.response.status === 404 || error.response.status === 410)) {
      return { questions: [], answers: [] };
    }
    handleError(error);
  }
};

// Usuń tag z quizu (opublikowany + drafty)
export const removeTagFromQuiz = async (tagId) => {
  try {
    const response = await axios.delete('http://localhost:3004/api/tags/' + tagId + '/remove-from-quiz');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};