import { api } from '../context/AuthContext';

export const getStats = async (period = 'monthly', startDate, endDate) => {
  let url = `/api/dashboard/stats?period=${period}`;
  if (startDate && endDate) url += `&startDate=${startDate}&endDate=${endDate}`;
  const response = await api.get(url);
  return response.data;
};

export const getTrends = async (period = 'monthly', startDate, endDate) => {
  let url = `/api/dashboard/trends?period=${period}`;
  if (startDate && endDate) url += `&startDate=${startDate}&endDate=${endDate}`;
  const response = await api.get(url);
  return response.data;
};

export const getCategoryBreakdown = async (period = 'monthly', startDate, endDate) => {
  let url = `/api/dashboard/category-breakdown?period=${period}`;
  if (startDate && endDate) url += `&startDate=${startDate}&endDate=${endDate}`;
  const response = await api.get(url);
  return response.data;
};

export const getRecentTransactions = async (period = 'monthly', startDate, endDate) => {
  let url = `/api/dashboard/recent?period=${period}`;
  if (startDate && endDate) url += `&startDate=${startDate}&endDate=${endDate}`;
  const response = await api.get(url);
  return response.data;
};

export const getHeatmap = async (year, month) => {
  let url = `/api/dashboard/heatmap`;
  if (year && month) {
    url += `?year=${year}&month=${month}`;
  }
  const response = await api.get(url);
  return response.data;
};
