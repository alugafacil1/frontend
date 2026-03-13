"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/lib/auth/useAuth";
import { propertyService } from "@/services/property/propertyService";
import { PropertyCard } from "@/components/PropertyCard";
import { 
  FunnelIcon, 
  CheckCircleIcon, 
  PauseCircleIcon, 
  CurrencyDollarIcon, 
  ClipboardDocumentCheckIcon, 
  XCircleIcon, 
  HeartIcon,
  MagnifyingGlassIcon, 
  PlusIcon
} from "@heroicons/react/24/outline";

import "@/assets/styles/property/MyProperties.css";

// Tipagem dos status adicionada a aba EXPLORE
type PropertyStatus = 'ALL' | 'ACTIVE' | 'PAUSED' | 'PLACED' | 'PENDING' | 'REJECTED' | 'FAVORITES' | 'EXPLORE';

export default function MyPropertiesPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [properties, setProperties] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentFilter, setCurrentFilter] = useState<PropertyStatus>('ALL');
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    async function fetchData() {
      if (!user || !user.id) return;

      try {
        const role = user.role as string;
        let propertiesPromise;

        // Se for inquilino, busca TODOS os imóveis do sistema e define a aba inicial como EXPLORE
        if (role === 'TENANT') {
          setCurrentFilter('EXPLORE');
          propertiesPromise = propertyService.getAll ? propertyService.getAll() : propertyService.getPropertiesByUserId(user.id);
        } else {
          // Se for dono/corretor, busca os imóveis vinculados ao usuário
          propertiesPromise = propertyService.getPropertiesByUserId(user.id); 
        }

        const [propsData, favsData] = await Promise.all([
          propertiesPromise,
          propertyService.getFavorites(user.id)
        ]);
        
        setProperties(Array.isArray(propsData) ? propsData : (propsData.content || []));
        setFavorites(Array.isArray(favsData) ? favsData : []);

      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, refreshCounter]); 

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // --- Lógica de Filtros e Abas por Role ---
  const getTabsForRole = (): PropertyStatus[] => {
    const role = user?.role as string;
    if (role === 'TENANT') return ['EXPLORE', 'FAVORITES'];
    if (role === 'AGENCY_ADMIN') {
        return ['ALL', 'ACTIVE', 'PAUSED', 'PLACED', 'PENDING', 'REJECTED', 'FAVORITES'];
    }
    if (role === 'REALTOR') return ['ALL', 'ACTIVE', 'PAUSED', 'PLACED', 'PENDING', 'REJECTED', 'FAVORITES'];
    return ['ALL', 'ACTIVE', 'PAUSED', 'PLACED', 'FAVORITES'];
  };

  const tabs = getTabsForRole();

  // Filtra o que vai renderizar na tela
  const listToRender = currentFilter === 'FAVORITES' 
    ? favorites 
    : currentFilter === 'EXPLORE'
      ? properties.filter(p => p.status === 'ACTIVE') // Inquilino só vê imóveis ativos
      : properties.filter(p => currentFilter === 'ALL' || p.status === currentFilter);

  const getStatusConfig = (status: PropertyStatus) => {
    switch (status) {
      case 'ALL': return { title: 'Todos', icon: FunnelIcon, color: 'text-gray-600', bannerTitle: 'Todos os Imóveis', bannerDesc: 'Visão geral de todos os seus anúncios.' };
      case 'EXPLORE': return { title: 'Explorar', icon: MagnifyingGlassIcon, color: 'text-indigo-600', bannerTitle: 'Imóveis Disponíveis', bannerDesc: 'Descubra o imóvel ideal para você alugar.' };
      case 'ACTIVE': return { title: 'Ativos', icon: CheckCircleIcon, color: 'text-blue-600', bannerTitle: 'Anúncios Ativos', bannerDesc: 'Estes anúncios estão visíveis para locatários.' };
      case 'PAUSED': return { title: 'Pausados', icon: PauseCircleIcon, color: 'text-amber-600', bannerTitle: 'Anúncios Pausados', bannerDesc: 'Estes anúncios estão ocultos temporariamente.' };
      case 'PLACED': return { title: 'Alugados', icon: CurrencyDollarIcon, color: 'text-emerald-600', bannerTitle: 'Imóveis Alugados', bannerDesc: 'Anúncios marcados como já locados.' };
      case 'PENDING': return { title: 'Revisão', icon: ClipboardDocumentCheckIcon, color: 'text-orange-500', bannerTitle: 'Aguardando Revisão', bannerDesc: 'Anúncios pendentes de aprovação.' };
      case 'REJECTED': return { title: 'Rejeitados', icon: XCircleIcon, color: 'text-red-500', bannerTitle: 'Anúncios Rejeitados', bannerDesc: 'Verifique os motivos da rejeição e corrija-os.' };
      case 'FAVORITES': return { title: 'Favoritos', icon: HeartIcon, color: 'text-rose-500', bannerTitle: 'Meus Favoritos', bannerDesc: 'Imóveis que você salvou para ver depois.' };
      default: return { title: status, icon: FunnelIcon, color: 'text-gray-600', bannerTitle: 'Imóveis', bannerDesc: '' };
    }
  };

  const roleStr = user?.role as string;
  const isAgencyAdmin = roleStr === 'AGENCY_ADMIN'; 
  const isTenant = roleStr === 'TENANT';

  return (
    <>
    <main className="my-properties-page">
      
      <div className="page-header">
        <div className="header-text">
          <h1 className="page-title">
            {isAgencyAdmin ? 'Gestão da Agência' : isTenant ? 'Explorar Imóveis' : 'Meus Imóveis'}
          </h1>
          <p className="page-subtitle">
            {isAgencyAdmin 
              ? 'Gerencie e aprove os anúncios dos corretores da sua agência.' 
              : isTenant ? 'Encontre e favorite os melhores imóveis para alugar.' : 'Gerencie seus anúncios e acompanhe o status.'}
          </p>
        </div>
      </div>

      <div className="tabs-container">
        {tabs.map((tab) => {
          const config = getStatusConfig(tab);
          const Icon = config.icon;
          
          // Lógica de contagem para as abas
          const count = tab === 'FAVORITES' 
            ? favorites.length 
            : tab === 'EXPLORE'
              ? properties.filter(p => p.status === 'ACTIVE').length
              : (tab === 'ALL' ? properties.length : properties.filter(p => p.status === tab).length);

          return (
            <div
              key={tab}
              onClick={() => setCurrentFilter(tab)}
              className={`tab-pill ${currentFilter === tab ? 'active' : ''}`}
            >
              <div className="tab-pill-icon">
                <Icon className="w-5 h-5" />
              </div>
              <div className="tab-pill-info">
                <span className="tab-pill-title">{config.title}</span>
                <span className="tab-pill-count">{count}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="main-content-wrapper">
        <div className="status-banner">
          <div className="banner-icon-wrapper">
            {React.createElement(getStatusConfig(currentFilter).icon, { className: "w-7 h-7" })}
          </div>
          <div className="banner-text">
            <h2>{getStatusConfig(currentFilter).bannerTitle}: {listToRender.length} {listToRender.length === 1 ? 'Anúncio' : 'Anúncios'}</h2>
            <p>{getStatusConfig(currentFilter).bannerDesc}</p>
          </div>
        </div>

        {listToRender.length > 0 ? (
          <div className="properties-grid">
            {listToRender.map((property, index) => {
              if (!property) return null;
              const uniqueKey = property.id || property.propertyId || `prop-${index}`;
              
              // Verifica se o ID deste imóvel existe na lista de favoritos
              const isFav = favorites.some(fav => {
                const favId = fav.propertyId || fav.id;
                const propId = property.propertyId || property.id;
                return favId === propId;
              });
              
              return (
                <PropertyCard 
                  key={uniqueKey} 
                  property={property} 
                  isFavoriteInit={isFav} // Repassa a informação otimista para o card
                  onUpdateSuccess={() => setRefreshCounter(prev => prev + 1)}
                />
              );
            })}
          </div>
        ) : (
          <div className="empty-state-modern">
            <div className="empty-state-icon-bg">
              {React.createElement(getStatusConfig(currentFilter).icon, { className: "w-8 h-8 text-gray-400" })}
            </div>
            <h3>
              {currentFilter === 'FAVORITES' ? 'Nenhum favorito ainda' : 'Nenhum anúncio encontrado'}
            </h3>
            <p>
              {currentFilter === 'FAVORITES' 
                ? 'Você ainda não salvou nenhum imóvel nos favoritos.' 
                : currentFilter === 'EXPLORE'
                  ? 'Nenhum imóvel ativo disponível no momento.'
                  : `Não há imóveis na categoria ${getStatusConfig(currentFilter).title.toLowerCase()} no momento.`}
            </p>
            {currentFilter !== 'ALL' && currentFilter !== 'FAVORITES' && currentFilter !== 'EXPLORE' && (
               <button onClick={() => setCurrentFilter('ALL')} className="btn-explore">
                 Ver Todos
               </button>
            )}
          </div>
        )}
      </div>
    </main>
    </>
  );
}