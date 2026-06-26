import { api } from '../context/AuthContext';

export const getTransactions = async (params) => {
  const response = await api.get(`/api/transactions`, { params });
  return response.data;
};

export const createTransaction = async (data) => {
  const response = await api.post(`/api/transactions`, data);
  return response.data;
};

export const getTransaction = async (id) => {
  const response = await api.get(`/api/transactions/${id}`);
  return response.data;
};

export const updateTransaction = async (id, data) => {
  const response = await api.put(`/api/transactions/${id}`, data);
  return response.data;
};

export const deleteTransaction = async (id) => {
  const response = await api.delete(`/api/transactions/${id}`);
  return response.data;
};

export const bulkDeleteTransactions = async (ids) => {
  const response = await api.post(`/api/transactions/bulk`, { ids });
  return response.data;
};

export const uploadReceipt = async (formData) => {
  const response = await api.post(`/api/transactions/upload-receipt`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
