import { api } from "../../lib/utils/api";

export interface PropertyPayload {
  title: string;
  description: string;
  type: string;
  address: {
    street: string;
    number: string;
    city: string;
    postalCode: string;
    neighborhood: string;
    state?: string; 
    complement?: string; 
  };
  priceInCents: number;
  weeklyRentInCents?: number;
  securityDepositInCents?: number;
  minimumLeaseMonths?: number;
  maxOccupants?: number;
  availableFrom?: string; 
  numberOfRooms: number;
  numberOfBedrooms?: number;
  numberOfBathrooms?: number;
  amenities?: string[];
  houseRules?: string[];
  geolocation?: {
    latitude: number;
    longitude: number;
  };
  furnished?: boolean;
  petFriendly?: boolean;
  garage?: boolean;
  isOwner?: boolean;
  videoUrl?: string;
  phoneNumber?: string;
  photoUrls?: string[];
  status?: string; 
  userId: string;
  agencyId?: string; // Campo adicionado para debug de vínculo
}

export interface PropertyFilterParams {
  page?: number;
  size?: number;
  sort?: string;
  type?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  [key: string]: any;
}

export const propertyService = {
  
  create: async (data: PropertyPayload | any) => {
    try {
      const response = await api.post('/api/properties', data);
      return response.data;
    } catch (error) {
      console.error("DEBUG [propertyService.create]: Erro na criação:", error);
      throw error;
    }
  },

 
  getAll: async (params: PropertyFilterParams = {}) => {
    try {
      const response = await api.get('/api/properties', { params });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar todos os imóveis:", error);
      throw error;
    }
  },

  getPropertiesByUserId: async (userId: string) => {
    const url = `/api/properties/user/${userId}`;
    const response = await api.get(url);
    return response.data;
},

  getById: async (id: string) => {
    try {
      const response = await api.get(`/api/properties/${id}`);
      return response.data;
    } catch (error) {
      console.error(`DEBUG [propertyService.getById]: Erro ao buscar ID ${id}:`, error);
      throw error;
    }
  },

  update: async (id: string, data: PropertyPayload | any) => {
    const response = await api.put(`/api/properties/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/api/properties/${id}/status`, { status });
    return response.data;
  },

  toggleFavorite: async (userId: string, propertyId: string) => {
    const response = await api.post(`/api/favorites/toggle?userId=${userId}&propertyId=${propertyId}`);
    return response.data;
  },

  uploadPhotos: async (propertyId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response = await api.post(`/api/properties/${propertyId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getFavorites: async (userId: string) => {
    const response = await api.get(`/api/favorites/user/${userId}`);
    return response.data;
  },

  checkIfFavorited: async (userId: string, propertyId: string) => {
    const response = await api.get(`/api/favorites/check?userId=${userId}&propertyId=${propertyId}`);
    return response.data.isFavorited; 
  },

  getByUser: async (userId: string) => {
    if (!userId || userId === "undefined") {
        console.error("DEBUG [propertyService.getByUser]: ID Inválido!");
        return [];
    }
    try {
      const response = await api.get(`/api/properties/owner/${userId}`);
      return response.data;
    } catch (error) {
      console.error("DEBUG [propertyService.getByUser]: Erro na requisição:", error);
      return [];
    }
  },

  delete: async (id: string) => {
    await api.delete(`/api/properties/${id}`);
  }
};