"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link'; // Boa prática usar Link do Next
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
      // ADICIONE ESTE LOG PARA DEBUGAR
      console.log("Usuário atual no useEffect:", user); 

      // CORREÇÃO: Verifique se user existe E se user.id existe
      if (user && user.id) { 
        try {
          const data = await propertyService.getByUser(user.id);
          setProperties(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Erro ao buscar imóveis", error);
        } finally {
          setLoading(false);
        }
      } else {
        // Se não tiver user.id ainda, não faça nada ou pare o loading se necessário
        console.warn("Aguardando ID do usuário...");
      }
    }

    // Só roda se o user mudar
    fetchProperties();
  }, [user]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <main className="my-properties-page">
      <div className="page-header">
        <h1 className="page-title">Meus Imóveis</h1>
      </div>

      {properties.length > 0 ? (
        <div className="properties-grid">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
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