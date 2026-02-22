import { useState, useEffect } from "react";

interface Country {
  label: string;
  value: string;
}

interface City {
  label: string;
  value: string;
}

export function useLocation(selectedCountry: string) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  // 1. Busca Países (Executa uma vez)
  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,translations")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data
          .map((c: any) => ({
            // Mostra em Português para o usuário
            label: c.translations?.por?.common || c.name.common,
            // Guarda o nome em Inglês no value (IMPORTANTE para a API de cidades)
            value: c.name.common, 
          }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label));
        
        setCountries(sorted);
      })
      .catch((err) => console.error("Erro ao carregar países", err));
  }, []);

  // 2. Busca Cidades (Executa quando selectedCountry muda)
  useEffect(() => {
    if (!selectedCountry) {
      setCities([]);
      return;
    }

    setLoadingCities(true);

    // CORREÇÃO: Mapa de tradução para casos onde o value possa ter vindo em PT
    // A API countriesnow.space EXIGE o nome em Inglês exato.
    const countryMap: Record<string, string> = {
      "Brasil": "Brazil",
      "Estados Unidos": "United States",
      "Espanha": "Spain",
      "Alemanha": "Germany",
      "França": "France",
      "Itália": "Italy",
      "Portugal": "Portugal" // Igual
    };

    // Tenta usar o mapa, se não tiver, usa o valor original (assumindo que já veio em inglês do select)
    const countryNameEnglish = countryMap[selectedCountry] || selectedCountry;

    fetch("https://countriesnow.space/api/v0.1/countries/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: countryNameEnglish }),
    })
      .then((res) => res.json())
      .then((resp) => {
        if (!resp.error) {
          setCities(resp.data.map((city: string) => ({ label: city, value: city })));
        } else {
          console.warn(`Cidades não encontradas para: ${countryNameEnglish}`);
          setCities([]);
        }
      })
      .catch((err) => {
        console.error("Erro API Cidades", err);
        setCities([]);
      })
      .finally(() => setLoadingCities(false));
  }, [selectedCountry]);

  return { countries, cities, loadingCities };
}