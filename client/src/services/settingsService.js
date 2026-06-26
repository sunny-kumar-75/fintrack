import { api } from '../context/AuthContext';

export const updateProfile = async (data) => {
  const response = await api.put(`/api/settings/profile`, data);
  return response.data;
};


export const deleteAccount = async () => {
  const response = await api.delete(`/api/settings/account`);
  return response.data;
};

export const exportCSV = async () => {
  const response = await api.get('/api/export/csv', {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'fintrack_transactions.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
  
  return true;
};
