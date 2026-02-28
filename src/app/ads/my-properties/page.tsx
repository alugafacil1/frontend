"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/lib/auth/useAuth";
import { propertyService } from "@/services/property/propertyService";
import { PropertyCard } from "@/components/PropertyCard";
import { PlusIcon, FunnelIcon, ClipboardDocumentCheckIcon, HeartIcon } from "@heroicons/react/24/outline";

import "@/assets/styles/property/MyProperties.css";

// Adicionamos 'FAVORITES' na tipagem
type PropertyStatus = 'ALL' | 'ACTIVE' | 'PAUSED' | 'PLACED' | 'PENDING' | 'REJECTED' | 'FAVORITES';

export default function MyPropertiesPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [properties, setProperties] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]); // Novo estado para favoritos
  const [loading, setLoading] = useState(true);
  
  const [currentFilter, setCurrentFilter] = useState<PropertyStatus>('ALL');

  useEffect(() => {
    async function fetchData() {
      if (!user || !user.id) return;

      try {
        const role = user.role as string;

        // Se for inquilino (TENANT), a aba padrão dele é Favoritos
        if (role === 'TENANT') {
          setCurrentFilter('FAVORITES');
        }

        // Busca simultânea: Busca os imóveis do usuário (se não for Tenant) e os favoritos dele
        const [propsData, favsData] = await Promise.all([
          role !== 'TENANT' ? propertyService.getByUser(user.id) : Promise.resolve([]),
          propertyService.getFavorites(user.id) // Nova chamada à API
        ]);

        setProperties(Array.isArray(propsData) ? propsData : []);
        setFavorites(Array.isArray(favsData) ? favsData : []);

      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // --- Lógica de Filtros e Abas ---
  const getTabsForRole = (): PropertyStatus[] => {
    const role = user?.role as string;

    if (role === 'TENANT') {
      return ['FAVORITES']; // Tenant só vê favoritos
    }
    
    if (role === 'AGENCY_ADMIN') {
      return ['PENDING', 'ALL', 'ACTIVE', 'PAUSED', 'PLACED', 'REJECTED', 'FAVORITES'];
    }
    
    // Default para OWNER, REALTOR, ADMIN
    return ['ALL', 'ACTIVE', 'PAUSED', 'PLACED', 'FAVORITES'];
  };

  const tabs = getTabsForRole();

  // Define qual lista será renderizada dependendo da aba
  // Se for aba FAVORITES, extraímos o imóvel de dentro do objeto Favorite (fav.property)
  const listToRender = currentFilter === 'FAVORITES' 
    ? favorites.map(fav => fav.property) // Mapeia para pegar apenas a propriedade
    : properties.filter(p => currentFilter === 'ALL' || p.status === currentFilter);

  const translateStatus = (status: string) => {
    const map: Record<string, string> = {
      ALL: 'Todos',
      ACTIVE: 'Ativos',
      PAUSED: 'Pausados',
      PLACED: 'Alugados',
      PENDING: 'Para Revisão',
      REJECTED: 'Rejeitados',
      FAVORITES: 'Meus Favoritos'
    };
    return map[status] || status;
  };

  const isAgencyAdmin = (user?.role as string) === 'AGENCY_ADMIN';
  const isTenant = (user?.role as string) === 'TENANT';

  return (
    <main className="my-properties-page">
      
      {/* Cabeçalho */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isAgencyAdmin ? 'Gestão da Agência' : isTenant ? 'Minha Conta' : 'Meus Imóveis'}
          </h1>
          <p className="page-subtitle">
            {isTenant ? 'Veja os imóveis que você curtiu.' : 'Gerencie seus anúncios e acompanhe o status.'}
          </p>
        </div>
      </div>

      {/* Abas de Filtro */}
      <div className="tabs-container">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setCurrentFilter(tab)}
            className={`tab-btn ${currentFilter === tab ? 'active' : ''} ${tab === 'PENDING' ? 'tab-alert' : ''}`}
          >
             {tab === 'PENDING' && <ClipboardDocumentCheckIcon className="w-4 h-4 mr-1"/>}
             {tab === 'FAVORITES' && <HeartIcon className="w-4 h-4 mr-1"/>}
             
             {translateStatus(tab)}
             
             <span className="tab-count">
               {tab === 'FAVORITES' 
                 ? favorites.length 
                 : (tab === 'ALL' ? properties.length : properties.filter(p => p.status === tab).length)
               }
             </span>
          </button>
        ))}
      </div>

      {/* Grid de Imóveis */}
      {listToRender.length > 0 ? (
        <div className="properties-grid">
          {listToRender.map((property, index) => {
            if (!property) return null; // Prevenção de erro caso fav.property venha nulo
            const uniqueKey = property.id || property.propertyId || `prop-${index}`;
            
            return (
              <PropertyCard 
                key={uniqueKey} 
                property={property} 
                // Se estiver na aba favoritos e o usuário desfavoritar, recarregamos a página para sumir da lista
                onUpdateSuccess={() => currentFilter === 'FAVORITES' ? window.location.reload() : null}
              />
            );
          })}
        </div>
      ) : (
        <div className="empty-state-container">
          {currentFilter === 'FAVORITES' ? <HeartIcon className="empty-icon" /> : <FunnelIcon className="empty-icon" />}
          
          <p className="empty-state-title">
            {currentFilter === 'FAVORITES' ? 'Nenhum favorito ainda' : 'Nenhum imóvel encontrado'}
          </p>
          <p className="empty-state-text">
            {currentFilter === 'FAVORITES' 
              ? 'Você ainda não salvou nenhum imóvel nos favoritos.' 
              : `Não há imóveis nesta categoria (${translateStatus(currentFilter)}).`}
          </p>
          
          {currentFilter !== 'ALL' && currentFilter !== 'FAVORITES' && (
             <button onClick={() => setCurrentFilter('ALL')} className="btn-secondary">
               Ver todos os imóveis
             </button>
          )}
        </div>
      )}
    </main>
  );
}