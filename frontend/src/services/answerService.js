import axios from "axios";

const API_URL = "http://localhost:3004";

// TODO: Dodać endpointy w backendzie jeśli nie istnieją
export const createAnswer = async (data) => {
  const res = await axios.post(`${API_URL}/api/answers`, data);
  return res.data;
};

export const updateAnswer = async (id, data) => {
  const res = await axios.put(`${API_URL}/api/answers/${id}`, data);
  return res.data;
};

export const deleteAnswer = async (id) => {
  await axios.delete(`${API_URL}/api/answers/${id}`);
};
