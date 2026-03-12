"use client";

import { useState, useMemo, useEffect } from "react";
import type { PropertyResponse } from "@/types/property";
import { useToast } from "@/components/ToastContext";

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: "Apartamento",
  HOUSE: "Casa",
  STUDIO: "Studio",
  COMMERCIAL: "Comercial",
};

export const RENT_RANGES = [
  { label: "R$ 0 - R$ 1.500", value: "0-1500", min: 0, max: 150000 },
  { label: "R$ 1.500 - R$ 3.000", value: "1500-3000", min: 150000, max: 300000 },
  { label: "R$ 3.000 - R$ 5.000", value: "3000-5000", min: 300000, max: 500000 },
  { label: "R$ 5.000+", value: "5000+", min: 500000, max: Infinity },
];

export interface SearchFilters {
  location: string;
  date: string;
  propertyType: string;
  rentRange: string;
}

interface SearchFormProps {
  properties?: PropertyResponse[];
  onSearch?: (filters: SearchFilters) => void;
  resetKey?: number;
}

export default function SearchForm({ properties = [], onSearch, resetKey }: SearchFormProps) {
  const { addToast } = useToast();
  const [location, setLocation] = useState("");
  // const [date, setDate] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [rentRange, setRentRange] = useState("");

  useEffect(() => {
    if (resetKey === undefined) return;
    setLocation("");
    // setDate("");
    setPropertyType("");
    setRentRange("");
  }, [resetKey]);

  const locationOptions = useMemo(() => {
    const cities = [...new Set(properties.map((p) => p.address.city).filter(Boolean))];
    return cities.sort().map((city) => ({ label: city, value: city }));
  }, [properties]);

  const propertyTypeOptions = useMemo(() => {
    const types = [...new Set(properties.map((p) => p.type).filter(Boolean))];
    return types.map((type) => ({ label: PROPERTY_TYPE_LABELS[type] ?? type, value: type }));
  }, [properties]);

  const rentRangeOptions = useMemo(() => {
    return RENT_RANGES.filter((range) =>
      properties.some(
        (p) => p.priceInCents >= range.min && p.priceInCents < range.max
      )
    );
  }, [properties]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.({ location, date: "", propertyType, rentRange });
    addToast('Clique em "Todas Propriedades" para limpar os filtros aplicados', "info");
  };

  return (
    <section className="search-section">
      <div className="landing-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-field">
            <select
              className="custom-select"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="" disabled hidden>Localização</option>
              {locationOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* <div className="search-field">
            <input
              className="custom-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="Data"
            />
          </div> */}

          <div className="search-field">
            <select
              className="custom-select"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
            >
              <option value="" disabled hidden>Tipo de Imóvel</option>
              {propertyTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="search-field">
            <select
              className="custom-select"
              value={rentRange}
              onChange={(e) => setRentRange(e.target.value)}
            >
              <option value="" disabled hidden>Preços</option>
              {rentRangeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="search-button">
            Pesquisar
          </button>
        </form>
      </div>
    </section>
  );
}
