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

export const propertyService = {
  
  create: async (data: PropertyPayload | any) => {
    console.log("DEBUG [propertyService.create]: Enviando payload:", data);
    try {
      const response = await api.post('/api/properties', data);
      console.log("DEBUG [propertyService.create]: Resposta do servidor:", response.data);
      return response.data;
    } catch (error) {
      console.error("DEBUG [propertyService.create]: Erro na criação:", error);
      throw error;
    }
  },

  getByAgency: async (userId: string) => {
    const url = `/api/properties/agency/${userId}`;
    console.log("DEBUG: Chamando URL:", url); // <--- ADICIONE ISSO
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
    console.log(`DEBUG [propertyService.update]: Atualizando ID ${id} com:`, data);
    const response = await api.put(`/api/properties/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    console.log(`DEBUG [propertyService.updateStatus]: Alterando ID ${id} para:`, status);
    const response = await api.patch(`/api/properties/${id}/status`, { status });
    return response.data;
  },

  toggleFavorite: async (userId: string, propertyId: string) => {
    const response = await api.post(`/api/favorites/toggle?userId=${userId}&propertyId=${propertyId}`);
    return response.data;
  },

  uploadPhotos: async (propertyId: string, files: File[]) => {
    console.log(`DEBUG [propertyService.uploadPhotos]: Enviando ${files.length} fotos para ID ${propertyId}`);
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
    console.log("DEBUG [propertyService.getByUser]: Iniciando busca para User ID:", userId);
    if (!userId || userId === "undefined") {
        console.error("DEBUG [propertyService.getByUser]: ID Inválido!");
        return [];
    }
    try {
      const response = await api.get(`/api/properties/owner/${userId}`);
      console.log(`DEBUG [propertyService.getByUser]: Sucesso! Encontrados ${response.data.length} imóveis:`, response.data);
      return response.data;
    } catch (error) {
      console.error("DEBUG [propertyService.getByUser]: Erro na requisição:", error);
      return [];
    }
  },

  delete: async (id: string) => {
    console.log(`DEBUG [propertyService.delete]: Removendo ID ${id}`);
    await api.delete(`/api/properties/${id}`);
  }
};