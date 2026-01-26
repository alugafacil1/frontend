"use client";

import { useState } from "react";

export default function SearchForm() {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [rentRange, setRentRange] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching:", { location, date, propertyType, rentRange });
  };

  return (
    <section className="search-section">
      <div className="landing-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-field">
            <select
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="">Localização</option>
              <option value="sao-paulo">São Paulo</option>
              <option value="rio-janeiro">Rio de Janeiro</option>
              <option value="belo-horizonte">Belo Horizonte</option>
            </select>
          </div>

          <div className="search-field">
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="Data"
            />
          </div>

          <div className="search-field">
            <select
              id="propertyType"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
            >
              <option value="">Tipo de Imóvel</option>
              <option value="apartment">Apartamento</option>
              <option value="house">Casa</option>
              <option value="commercial">Comercial</option>
              <option value="studio">Studio</option>
            </select>
          </div>

          <div className="search-field">
            <select
              id="rentRange"
              value={rentRange}
              onChange={(e) => setRentRange(e.target.value)}
            >
              <option value="">Preços</option>
              <option value="0-1500">R$ 0 - R$ 1.500</option>
              <option value="1500-3000">R$ 1.500 - R$ 3.000</option>
              <option value="3000-5000">R$ 3.000 - R$ 5.000</option>
              <option value="5000+">R$ 5.000+</option>
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
