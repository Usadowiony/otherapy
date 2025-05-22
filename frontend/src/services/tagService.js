import axios from 'axios';

const API_URL = 'http://localhost:3003/api';

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
    throw new Error('Nie można połączyć się z serwerem. Sprawdź połączenie internetowe.');
  } else {
    throw new Error(error.message || 'Wystąpił nieoczekiwany błąd');
  }
};

export const getAllTags = async () => {
  try {
    const response = await axios.get(`${API_URL}/tags`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const createTag = async (tagData) => {
  try {
    const response = await axios.post(
      `${API_URL}/admin/tags`,
      tagData,
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

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

export const deleteTag = async (tagId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/admin/tags/${tagId}`,
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const removeTagFromQuiz = async () => { throw new Error('Usuwanie tagów jest wyłączone.'); };
export const getQuizTagUsage = async () => { return { questions: [], answers: [] }; };

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

export const getTagTherapistUsage = async (tagId) => {
  try {
    const response = await axios.get(`http://localhost:3001/api/therapists/tags/${tagId}/usage`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getTagQuizUsage = async (tagId) => {
  try {
    const response = await axios.get(`http://localhost:3004/api/quizzes/api/tags/${tagId}/quiz-usage`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};