"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from "@/lib/auth/useAuth";
import { propertyService } from "@/services/property/propertyService";
import { PropertyCard } from "@/components/PropertyCard";

// Import CSS
import "@/assets/styles/property/MyProperties.css";

export default function MyPropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperties() {

      if (!user || !user.id) {
        
        return; 
      }

      try {
        const data = await propertyService.getByUser(user.id);
        setProperties(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao buscar imóveis:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, [user]); 

 
  if (loading && (!user || !user.id)) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <main className="my-properties-page">
      <div className="page-header">
        <div className="flex justify-between items-center">
            <h1 className="page-title">Meus Imóveis</h1>
            
        </div>
      </div>

      {properties.length > 0 ? (
        <div className="properties-grid">
          {properties.map((property, index) => {
            // Tenta pegar o ID de qualquer forma que o backend mandar, se falhar, usa o index
            const uniqueKey = property.id || property.propertyId || `fallback-key-${index}`;
            
            return (
              <PropertyCard key={uniqueKey} property={property} />
            );
          })}
        </div>
      ) : (
        <div className="empty-state-container">
          <p className="empty-state-text">
            Você ainda não publicou nenhum imóvel.
          </p>
          <Link href="/ads/create" className="empty-state-link">
            Publicar meu primeiro anúncio
          </Link>
        </div>
      )}
    </main>
  );
}