import { useCallback } from "react";

export function useGeolocation() {
  
  const fetchCoordinates = useCallback(async (addressQuery: string, fallbackQuery?: string) => {
    try {
      // 1ª Tentativa: Busca o endereço exato (com número)
      let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(addressQuery)}`);
      if (!response.ok) throw new Error("Falha na requisição de geolocalização");

      let data = await response.json();

      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };
      }
      
      // 2ª Tentativa (Fallback): Se não achou o número, tenta buscar apenas pela Rua e Cidade
      if (fallbackQuery) {
        console.warn("Número exato não encontrado no mapa. Buscando pela rua...");
        response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(fallbackQuery)}`);
        data = await response.json();

        if (data && data.length > 0) {
          return {
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon)
          };
        }
      }
      
      // Retorna 0.0 caso não encontre nem a rua
      return { latitude: 0.0, longitude: 0.0 };
      
    } catch (error) {
      console.error("Erro ao buscar coordenadas:", error);
      return { latitude: 0.0, longitude: 0.0 };
    }
  }, []);

  return { fetchCoordinates };
}