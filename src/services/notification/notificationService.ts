import { api } from "../../lib/utils/api";

export const notificationService = {

  getAll: async (page = 0, size = 10) => {
    const response = await api.get(`/api/notifications?page=${page}&size=${size}`);
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.patch(`/api/notifications/${id}/read`);
    return response.data;
  },
  
  delete: async (id: string) => {
    await api.delete(`/api/notifications/${id}`);
  },

  getByUser: async (userId: string, page = 0, size = 10) => {
    const response = await api.get(`/api/notifications/user/${userId}?page=${page}&size=${size}`);
    return response.data;
  },
};