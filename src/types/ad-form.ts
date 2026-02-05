export interface AdFormData {
  country: string;
  city: string;
  postalCode: string;
  propertyType: string;
  address: string;
  price: string;
  rooms: number;
  bathrooms: number;
  hasGarden: boolean;
  hasParking: boolean;
  hasKitchen: boolean;
  hasWifi: boolean;
  images: File[];
}