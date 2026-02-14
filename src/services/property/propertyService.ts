import { api } from "../../lib/utils/api";


export interface PropertyPayload {
  title: string;
  description: string;
  
  address: {
    street: string;
    number: string;
    city: string;
    state: string;
    postalCode: string;
    neighborhood: string;
  };
  
  geolocation: {
    latitude: number;
    longitude: number;
  };
  
  priceInCents: number;
  numberOfRooms: number;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  
  furnished: boolean;
  petFriendly: boolean;
  garage: boolean;
  isOwner: boolean;
  
  videoUrl: string;
  phoneNumber: string;
  photoUrls: string[];
  
  status: string; 
  type: string;   
  
  userId: string;
}

export const propertyService = {
  
  create: async (data: PropertyPayload) => {
   
    const response = await api.post('/api/properties', data);
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
    const response = await api.get(`/properties/owner/${userId}`);
    return response.data;
},

  
  delete: async (id: string) => {
    await api.delete(`/api/properties/${id}`);
  }
};