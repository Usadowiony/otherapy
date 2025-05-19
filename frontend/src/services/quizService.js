import axios from "axios";

const API_URL = "http://localhost:3004";

export const getQuiz = async (quizId) => {
  const res = await axios.get(`${API_URL}/api/quizzes/${quizId}`);
  return res.data;
};

export const getAllQuizzes = async () => {
  const res = await axios.get(`${API_URL}/api/quizzes`);
  return res.data;
};

export const updateQuiz = async (quizId, data) => {
  const res = await axios.put(`${API_URL}/api/quizzes/${quizId}`, data);
  return res.data;
};
