"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { propertyService } from '@/services/property/propertyService';
import { 
  MapPinIcon, 
  HomeIcon, 
  UserGroupIcon, 
  CalendarIcon, 
  CheckBadgeIcon,
  NoSymbolIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';


import "@/assets/styles/property/PropertyDetails.css";

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    async function load() {
      if (params?.id) {
        try {
          // O params.id pode ser array em algumas configs, garantindo string
          const id = Array.isArray(params.id) ? params.id[0] : params.id;
          const data = await propertyService.getById(id);
          setProperty(data);
        } catch (error) {
          console.error("Erro ao carregar imóvel", error);
        } finally {
          setLoading(false);
        }
      }
    }
    load();
  }, [params?.id]);

  if (loading) return <div className="loading-container">Carregando...</div>;
  if (!property) return <div className="error-container">Imóvel não encontrado.</div>;

  const formatCurrency = (cents: number | null) => {
    if (cents === null || cents === undefined) return "Não informado";
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const images = property.photoUrls && property.photoUrls.length > 0 
    ? property.photoUrls 
    : ['https://placehold.co/800x600?text=Sem+Foto'];

  return (
    <main className="details-page">
      
      {/* Botão Voltar */}
      <div className="back-button-container">
        <button onClick={() => router.back()} className="back-btn">
            <ArrowLeftIcon className="icon-sm"/> Voltar
        </button>
      </div>

      <div className="details-grid">
        
        {/* Coluna Esquerda: Fotos e Descrição */}
        <div className="left-column">
          
          {/* Galeria de Fotos */}
          <div className="gallery-card">
            <div className="main-image-container">
                <img 
                    src={images[selectedImage]} 
                    alt="Foto principal do imóvel" 
                    className="main-img"
                />
            </div>
            
            <div className="thumbnails-row">
                {images.map((img: string, idx: number) => (
                    <button 
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`thumb-btn ${selectedImage === idx ? 'active' : ''}`}
                    >
                        <img src={img} className="thumb-img" alt={`miniatura ${idx}`}/>
                    </button>
                ))}
            </div>
          </div>

          {/* Cabeçalho do Imóvel */}
          <div className="info-card">
            <div className="header-row">
                <div>
                    <h1 className="property-title">{property.title}</h1>
                    <div className="property-address">
                        <MapPinIcon className="icon-sm" />
                        <span>{property.address.street}, {property.address.number} - {property.address.neighborhood}, {property.address.city}/{property.address.state}</span>
                    </div>
                </div>
                <div className="price-display">
                    <p className="price-label">Aluguel Mensal</p>
                    <p className="price-value">{formatCurrency(property.priceInCents)}</p>
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-item">
                    <HomeIcon className="icon-sm" /> {property.numberOfBedrooms} Quartos
                </div>
                <div className="stat-item">
                    <span className="badge">WC</span> {property.numberOfBathrooms} Banheiros
                </div>
                <div className="stat-item">
                    <UserGroupIcon className="icon-sm" /> Max. {property.maxOccupants || '-'} Pessoas
                </div>
            </div>
          </div>

          {/* Descrição */}
          <div className="info-card">
            <h2 className="section-title">Sobre o imóvel</h2>
            <p className="description-text">
                {property.description}
            </p>
          </div>

          {/* Comodidades */}
          <div className="info-card">
            <h2 className="section-title">O que este lugar oferece</h2>
            <div className="amenities-grid">
                {property.amenities && property.amenities.map((item: string, idx: number) => (
                    <div key={idx} className="amenity-item">
                        <CheckBadgeIcon className="icon-check" />
                        {item}
                    </div>
                ))}
                {(!property.amenities || property.amenities.length === 0) && <p className="empty-text">Nenhuma comodidade listada.</p>}
            </div>
          </div>

        </div>

        {/* Coluna Direita: Cards de Valores e Regras (Sticky) */}
        <div className="right-column">
          
          {/* Card de Preços Detalhados */}
          <div className="info-card sticky-wrapper">
            <h3 className="values-title">Valores</h3>
            
            <div className="values-list">
                <div className="value-row">
                    <span className="label">Aluguel Mensal</span>
                    <span className="value">{formatCurrency(property.priceInCents)}</span>
                </div>
                
                {property.weeklyRentInCents && (
                    <div className="value-row">
                        <span className="label">Aluguel Semanal</span>
                        <span className="value">{formatCurrency(property.weeklyRentInCents)}</span>
                    </div>
                )}
                
                {property.securityDepositInCents && (
                    <div className="value-row">
                        <span className="label">Caução (Depósito)</span>
                        <span className="value">{formatCurrency(property.securityDepositInCents)}</span>
                    </div>
                )}
            </div>

            <div className="dates-info">
                {property.minimumLeaseMonths && (
                    <div className="date-item">
                        <CalendarIcon className="icon-sm" style={{ color: '#3b82f6' }} />
                        Mínimo de <strong>{property.minimumLeaseMonths} meses</strong>
                    </div>
                )}
                {property.availableFrom && (
                    <div className="date-item">
                        <CalendarIcon className="icon-sm" style={{ color: '#22c55e' }} />
                        Disponível em <strong>{new Date(property.availableFrom).toLocaleDateString('pt-BR')}</strong>
                    </div>
                )}
            </div>

            <button className="cta-button">
                Entrar em Contato
            </button>
          </div>

          {/* Regras da Casa */}
          <div className="info-card">
             <h3 className="section-title">Regras da Casa</h3>
             <ul className="rules-list">
                {property.houseRules && property.houseRules.map((rule: string, idx: number) => (
                    <li key={idx} className="rule-item">
                        <NoSymbolIcon className="icon-no" />
                        {rule}
                    </li>
                ))}
                 {(!property.houseRules || property.houseRules.length === 0) && <p className="empty-text">Sem regras específicas.</p>}
             </ul>
          </div>

        </div>
      </div>
    </main>
  );
}