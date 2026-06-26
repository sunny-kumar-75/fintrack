import { api } from '../context/AuthContext';

export const getInsights = async () => {
  const response = await api.get(`/api/ai/insights`);
  return response.data;
};

export const chatWithAI = async (message) => {
  const response = await api.post(`/api/ai/chat`, { message });
  return response.data;
};

export const scanReceipt = async (imageUrl) => {
  const response = await api.post(`/api/ai/scan-receipt`, { imageUrl });
  return response.data;
};
