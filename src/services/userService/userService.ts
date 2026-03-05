import { api } from "../../lib/utils/api";

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  photoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;       
  size: number;
}

export const userService = {

  getAll: async (page = 0, size = 10): Promise<PageResponse<UserResponse>> => {
    const response = await api.get(`/api/users?page=${page}&size=${size}`);
    return response.data;
  },

  getById: async (id: string): Promise<UserResponse> => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  getTotalCount: async (): Promise<number> => {
    const response = await api.get(`/api/users?page=0&size=1`);
    return response.data.totalElements ?? 0;
  },

  update: async (id: string, data: Partial<UserResponse>) => {
    const response = await api.put(`/api/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/api/users/${id}`);
  },

};