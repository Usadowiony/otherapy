import axios from "axios";

const API_URL = "http://localhost:3004";

export const getQuestionsForQuiz = async (quizId) => {
  const res = await axios.get(`${API_URL}/api/questions/quiz/${quizId}`);
  return res.data;
};

export const createQuestion = async (data) => {
  const res = await axios.post(`${API_URL}/api/questions`, data);
  return res.data;
};

export const updateQuestion = async (id, data) => {
  const res = await axios.put(`${API_URL}/api/questions/${id}`, data);
  return res.data;
};

export const deleteQuestion = async (id) => {
  await axios.delete(`${API_URL}/api/questions/${id}`);
};
