import { api } from '../context/AuthContext';

export const getRecurring = async () => {
  const response = await api.get(`/api/recurring`);
  return response.data;
};

export const createRecurring = async (data) => {
  const response = await api.post(`/api/recurring`, data);
  return response.data;
};

export const updateRecurring = async (id, data) => {
  const response = await api.put(`/api/recurring/${id}`, data);
  return response.data;
};

export const deleteRecurring = async (id) => {
  const response = await api.delete(`/api/recurring/${id}`);
  return response.data;
};
