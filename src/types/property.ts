export type PropertyStatus = 'PENDING' | 'ACTIVE' | 'PAUSED' | 'PLACED' | 'REJECTED';
export type PropertyType = 'HOUSE' | 'APARTMENT' | 'STUDIO';

export interface AddressResponse {
    street: string;
    city: string;
    state: string;
    number: string;
    PostalCode?: string;
    neighborhood?: string;
}

export interface PropertyResponse {
    propertyId: string;
    title: string;
    description: string;
    address: AddressResponse;
    priceInCents: number;
    numberOfRooms: number;
    numberOfBedrooms: number;
    numberOfBathrooms: number;
    furnished: boolean;
    petFriendly: boolean;
    garage: boolean;
    status: PropertyStatus | string;
    type: PropertyType;
    ownerId: string;
    createdAt: string;
    
    photoUrls?: string[]; 
    phoneNumber?: string;
}

export interface UpdatePropertyStatusRequest {
    id: string;
    status: PropertyStatus;
    reason?: string;
}