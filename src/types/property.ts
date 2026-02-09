export interface PropertyResponse {
    propertyId: string;
    title: string;
    description: string;
    address: {
        street: string;
        city: string;
        state: string;
        number: string;
    };
    priceInCents: number;
    numberOfRooms: number;
    numberOfBedrooms: number;
    numberOfBathrooms: number;
    furnished: boolean;
    petFriendly: boolean;
    garage: boolean;
    status: string;
    type: 'HOUSE' | 'APARTMENT' | 'STUDIO';
    ownerId: string;
    createdAt: string;
}