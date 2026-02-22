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
}

export const propertyService = {
  
  create: async (data: PropertyPayload | any) => {
    const response = await api.post('/api/properties', data);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/properties/${id}`);
    return response.data;
  },

  update: async (id: string, data: PropertyPayload | any) => {
    const response = await api.put(`/api/properties/${id}`, data);
    return response.data;
  },

  uploadPhotos: async (propertyId: string, files: File[]) => {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await api.post(`/api/properties/${propertyId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getByUser: async (userId: string) => {
    if (!userId || userId === "undefined") {
        console.error("Tentativa de buscar imóveis com ID inválido");
        return [];
    }
    const response = await api.get(`/api/properties/owner/${userId}`);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/api/properties/${id}`);
  }
};