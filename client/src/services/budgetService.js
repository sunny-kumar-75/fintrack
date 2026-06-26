import { api } from '../context/AuthContext';

export const getBudget = async (month, year) => {
  const response = await api.get(`/api/budgets`, { params: { month, year } });
  return response.data;
};

export const createOrUpdateBudget = async (data) => {
  const response = await api.post(`/api/budgets`, data);
  return response.data;
};

export const getBudgetStatus = async (month, year) => {
  const response = await api.get(`/api/budgets/status`, { params: { month, year } });
  return response.data;
};
