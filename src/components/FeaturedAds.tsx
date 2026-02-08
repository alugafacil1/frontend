"use client";

import { useState } from "react";

export interface Property {
  id: number;
  title: string;
  location: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  image?: string;
}

interface FeaturedAdsProps {
  properties: Property[];
  title?: string;
  subtitle?: string;
}

export default function FeaturedAds({ 
  properties, 
  title = "Anúncios com Destaque",
  subtitle = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco"
}: FeaturedAdsProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filters = [
    { id: "all", label: "Todas Propriedades" },
    { id: "house", label: "Casas" },
    { id: "apartment", label: "Apartamentos" },
    { id: "kitnet", label: "Kits" },
  ];

  const filteredProperties =
    activeFilter === "all"
      ? properties
      : properties.filter((property) => property.type === activeFilter);

  return (
    <section className="featured-section">
      <div className="landing-container">
        <div className="section-header">
          <h2 className="section-title">
            {(() => {
              const words = title.split(" ");
              const lastWord = words.pop();
              return (
                <>
                  {words.join(" ")} <span className="highlight">{lastWord}</span>
                </>
              );
            })()}
          </h2>
          <p className="section-subtitle">
            {subtitle}
          </p>
        </div>

        <div className="category-tabs">
          {filters.map((filter) => (
            <button
              key={filter.id}
              className={`category-tab ${activeFilter === filter.id ? "active" : ""}`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="property-grid">
          {filteredProperties.map((property) => (
            <div key={property.id} className="property-card">
              <div className="property-image">
                {/* Placeholder for image */}
                <div style={{ width: "100%", height: "100%", background: "#e5e7eb" }}></div>
              </div>
              <div className="property-info">
                <h3 className="property-title">{property.title}</h3>
                <p className="property-location">
                  <span style={{ fontSize: "12px", color: "#8B8E99" }}>Type:</span>{" "}
                  <span style={{ color: "#8B8E99" }}>Learn more</span>
                </p>
                <p className="property-description">{property.location}</p>
                <div className="property-features">
                  <div className="feature">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                        stroke="#515DEF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 22V12H15V22"
                        stroke="#515DEF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{property.bedrooms}</span>
                  </div>
                  <div className="feature">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="11" width="18" height="11" rx="2" stroke="#515DEF" strokeWidth="2" />
                      <path
                        d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11"
                        stroke="#515DEF"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>{property.bathrooms}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
