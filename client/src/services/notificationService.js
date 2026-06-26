import { api } from '../context/AuthContext';

export const getNotifications = async () => {
  const response = await api.get(`/api/notifications`);
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get(`/api/notifications/unread-count`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await api.put(`/api/notifications/read-all`);
  return response.data;
};
