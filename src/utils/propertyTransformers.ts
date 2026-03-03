import type { PropertyResponse } from "@/types/property";
import type { Property } from "@/components/FeaturedAds";
import type { CardItem } from "@/components/LatestUpdates";

/**
 * Converte o tipo da propriedade da API para o formato esperado pelo componente
 */
function convertPropertyType(apiType: string): string {
  const typeMap: Record<string, string> = {
    APARTMENT: "apartment",
    HOUSE: "house",
    STUDIO: "kitnet",
  };
  return typeMap[apiType] || "apartment";
}

/**
 * Constrói o endereço completo a partir do objeto address da API
 */
function buildLocation(address: PropertyResponse["address"]): string {
  const parts: string[] = [];
  
  if (address.street) {
    parts.push(address.street);
    if (address.number) {
      parts.push(address.number);
    }
  }
  
  if (address.neighborhood) {
    parts.push(address.neighborhood);
  }
  
  if (address.city) {
    parts.push(address.city);
  }
  
  if (address.state) {
    parts.push(address.state);
  }
  
  return parts.join(", ");
}

/**
 * Transforma PropertyResponse da API para Property do componente FeaturedAds
 */
export function transformPropertyResponseToProperty(
  property: PropertyResponse,
  index: number
): Property {
  return {
    id: index + 1, // Usa índice + 1 como ID numérico temporário
    title: property.title,
    location: buildLocation(property.address),
    type: convertPropertyType(property.type),
    bedrooms: property.numberOfBedrooms,
    bathrooms: property.numberOfBathrooms,
    image: property.photoUrls && property.photoUrls.length > 0 
      ? property.photoUrls[0] 
      : undefined,
  };
}

/**
 * Transforma um array de PropertyResponse para Property[]
 */
export function transformPropertyResponsesToProperties(
  properties: PropertyResponse[]
): Property[] {
  return properties.map((property, index) =>
    transformPropertyResponseToProperty(property, index)
  );
}

/**
 * Transforma PropertyResponse da API para CardItem do componente LatestUpdates
 */
export function transformPropertyResponseToCardItem(
  property: PropertyResponse,
  index: number
): CardItem {
  return {
    id: property.propertyId,
    name: property.title,
    title: property.description || property.title,
    location: buildLocation(property.address),
    image: property.photoUrls && property.photoUrls.length > 0 
      ? property.photoUrls[0] 
      : undefined,
    // Campos opcionais que podem ser úteis
    rating: undefined, // Não temos rating na API
    propertiesSold: undefined, // Não temos essa informação na API
  };
}

/**
 * Transforma um array de PropertyResponse para CardItem[]
 */
export function transformPropertyResponsesToCardItems(
  properties: PropertyResponse[]
): CardItem[] {
  return properties.map((property, index) =>
    transformPropertyResponseToCardItem(property, index)
  );
}
