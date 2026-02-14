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

  // Busca Países (Executa uma vez)
  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,translations")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data
          .map((c: any) => ({
            label: c.translations?.por?.common || c.name.common,
            value: c.name.common, // Nome em inglês (necessário para a API de cidades)
          }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label));
        setCountries(sorted);
      })
      .catch((err) => console.error("Erro ao carregar países", err));
  }, []);

  // Busca Cidades (Executa quando selectedCountry muda)
  useEffect(() => {
    if (!selectedCountry) {
      setCities([]);
      return;
    }

    setLoadingCities(true);
    fetch("https://countriesnow.space/api/v0.1/countries/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: selectedCountry }),
    })
      .then((res) => res.json())
      .then((resp) => {
        if (!resp.error) {
          setCities(resp.data.map((city: string) => ({ label: city, value: city })));
        } else {
          setCities([]);
        }
      })
      .catch(() => setCities([]))
      .finally(() => setLoadingCities(false));
  }, [selectedCountry]);

  return { countries, cities, loadingCities };
}