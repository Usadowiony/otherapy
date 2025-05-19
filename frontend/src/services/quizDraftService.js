import axios from "axios";

const API_URL = "http://localhost:3004";

export const saveQuizDraft = async (quizId, draftData) => {
  const res = await axios.post(`${API_URL}/api/quiz-drafts/${quizId}`, draftData);
  return res.data;
};

export const getQuizDrafts = async (quizId) => {
  const res = await axios.get(`${API_URL}/api/quiz-drafts/${quizId}`);
  return res.data;
};

export const getQuizDraft = async (quizId, draftId) => {
  const res = await axios.get(`${API_URL}/api/quiz-drafts/${quizId}/${draftId}`);
  return res.data;
};

export const deleteQuizDraft = async (quizId, draftId) => {
  await axios.delete(`${API_URL}/api/quiz-drafts/${quizId}/${draftId}`);
};

export const updateQuizDraft = async (quizId, draftId, draftData) => {
  const res = await axios.put(`${API_URL}/api/quiz-drafts/${quizId}/${draftId}`, draftData);
  return res.data;
};
