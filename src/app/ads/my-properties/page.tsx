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
  PlusIcon
} from "@heroicons/react/24/outline";

import "@/assets/styles/property/MyProperties.css";
import Footer from '@/components/Footer';

// Tipagem dos status
type PropertyStatus = 'ALL' | 'ACTIVE' | 'PAUSED' | 'PLACED' | 'PENDING' | 'REJECTED' | 'FAVORITES';

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

        if (role === 'TENANT') {
          setCurrentFilter('FAVORITES');
        }

        let propertiesPromise;

        propertiesPromise = propertyService.getPropertiesByUserId(user.id); 

        const [propsData, favsData] = await Promise.all([
          propertiesPromise,
          propertyService.getFavorites(user.id)
        ]);
        console.log(favsData)
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
    if (role === 'TENANT') return ['FAVORITES'];
    // Ajustado para AGENCY_ADMIN
    if (role === 'AGENCY_ADMIN') {
        return ['ALL', 'ACTIVE', 'PAUSED', 'PLACED', 'PENDING', 'REJECTED', 'FAVORITES'];
    }
    if (role === 'REALTOR') return ['ALL', 'ACTIVE', 'PAUSED', 'PLACED', 'PENDING', 'REJECTED', 'FAVORITES'];
    return ['ALL', 'ACTIVE', 'PAUSED', 'PLACED', 'FAVORITES'];
  };

  const tabs = getTabsForRole();

  const listToRender = currentFilter === 'FAVORITES' 
    ? favorites.map(fav => fav) 
    : properties.filter(p => currentFilter === 'ALL' || p.status === currentFilter);

  const getStatusConfig = (status: PropertyStatus) => {
    switch (status) {
      case 'ALL': return { title: 'Todos', icon: FunnelIcon, color: 'text-gray-600', bannerTitle: 'Todos os Imóveis', bannerDesc: 'Visão geral de todos os seus anúncios.' };
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
  const isAgencyAdmin = roleStr === 'AGENCY_ADMIN'; // Ajuste estrito para AGENCY_ADMIN
  const isTenant = roleStr === 'TENANT';

  return (
    <>
    <main className="my-properties-page">
      
      <div className="page-header">
        <div className="header-text">
          <h1 className="page-title">
            {isAgencyAdmin ? 'Gestão da Agência' : isTenant ? 'Minha Conta' : 'Meus Imóveis'}
          </h1>
          <p className="page-subtitle">
            {isAgencyAdmin 
              ? 'Gerencie e aprove os anúncios dos corretores da sua agência.' 
              : isTenant ? 'Veja os imóveis que você curtiu.' : 'Gerencie seus anúncios e acompanhe o status.'}
          </p>
        </div>
        
      </div>

      <div className="tabs-container">
        {tabs.map((tab) => {
          const config = getStatusConfig(tab);
          const Icon = config.icon;
          const count = tab === 'FAVORITES' 
            ? favorites.length 
            : (tab === 'ALL' ? properties.length : properties.filter(p => p.status === tab).length);

          return (
            <button
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
            </button>
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
              
              return (
                <PropertyCard 
                  key={uniqueKey} 
                  property={property} 
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
                : `Não há imóveis na categoria ${getStatusConfig(currentFilter).title.toLowerCase()} no momento.`}
            </p>
            {currentFilter !== 'ALL' && currentFilter !== 'FAVORITES' && (
               <button onClick={() => setCurrentFilter('ALL')} className="btn-explore">
                 Ver Todos
               </button>
            )}
            {/* {currentFilter === 'FAVORITES' && (
               <button onClick={() => router.push('/search')} className="btn-explore">
                 Explorar
               </button>
            )} */}
          </div>
        )}
      </div>
    </main>
    
    </>
  );
}