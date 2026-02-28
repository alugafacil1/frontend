"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  HeartIcon, 
  MapPinIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PhotoIcon 
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { propertyService } from "@/services/property/propertyService";
import { useAuth } from "@/lib/auth/useAuth"; 

import "@/assets/styles/property/MyProperties.css"; 

interface PropertyCardProps {
  property: any;
  onUpdateSuccess?: () => void; 
}

export const PropertyCard = ({ property, onUpdateSuccess }: PropertyCardProps) => {
  const router = useRouter();
  const { user } = useAuth();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false); // Começa como false por padrão
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  const propertyId = property.id || property.propertyId;

  // Garante uma lista válida de imagens ou fallback
  const images = property.photoUrls && property.photoUrls.length > 0 
    ? property.photoUrls 
    : [];

  // =================================================================
  // NOVO: Verifica se está favoritado logo ao carregar o componente
  // =================================================================
  useEffect(() => {
    async function checkFavoriteStatus() {
      // Se não tiver usuário logado, não precisa buscar nada
      if (!user || !user.id) return; 
      
      try {
        const isFav = await propertyService.checkIfFavorited(user.id, propertyId);
        setIsFavorited(isFav);
      } catch (error) {
        console.error("Erro ao verificar status de favorito", error);
      }
    }

    checkFavoriteStatus();
  }, [user, propertyId]);

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    // 1. A barreira do TypeScript: se não tiver usuário ou ID, para tudo aqui.
    if (!user || !user.id) {
      alert("Você precisa estar logado para favoritar um imóvel.");
      return; 
    }
    
    // 2. Atualização otimista (muda a cor do coração na hora pro usuário não esperar)
    const previousState = isFavorited;
    setIsFavorited(!previousState);
    
    try {
      // 3. Faz a requisição para favoritar / desfavoritar
      const response = await propertyService.toggleFavorite(user.id, propertyId);
      
      // Atualiza com a verdade que veio do banco de dados
      setIsFavorited(response.isFavorited); 
      
    } catch (error) {
      console.error("Erro ao favoritar", error);
      // Se der erro no backend, desfaz a pintura do coração
      setIsFavorited(previousState); 
      alert("Erro ao favoritar o imóvel.");
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newStatus = e.target.value;

    if (!window.confirm("Deseja realmente alterar o status deste anúncio?")) {
      e.target.value = property.status; // Reverte para o valor original se cancelar
      return;
    }

    setIsUpdatingStatus(true);

    try {
      await propertyService.updateStatus(propertyId, newStatus);
      
      if (onUpdateSuccess) {
        onUpdateSuccess();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      alert("Não foi possível alterar o status do anúncio.");
      e.target.value = property.status; // Reverte em caso de erro
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCardClick = () => {
    router.push(`/ads/${propertyId}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/ads/edit/${propertyId}`);
  };

  const formattedPrice = Number(property.priceInCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  const translateType = (type: string) => {
    const types: Record<string, string> = { APARTMENT: 'Apartamento', HOUSE: 'Casa', ROOM: 'Quarto' };
    return types[type] || type || 'Imóvel';
  };

  // Ajuda a colorir o select de acordo com o status atual
  const getStatusColorClass = (status: string) => {
    switch(status) {
      case 'ACTIVE': return 'status-active';
      case 'PAUSED': return 'status-paused';
      case 'PLACED': return 'status-placed';
      default: return '';
    }
  };

  return (
    <div 
      className={`property-card ${isUpdatingStatus ? 'is-updating' : ''}`} 
      onClick={handleCardClick}
    >
      {/* Área da Imagem (Carrossel) */}
      <div className="card-image-container">
        {images.length > 0 && !imgError ? (
          <img 
            src={images[currentImageIndex]} 
            alt={`Foto do imóvel ${currentImageIndex + 1}`} 
            className="card-img"
            onError={() => setImgError(true)} 
          />
        ) : (
          <div className="no-image-placeholder">
            <PhotoIcon className="placeholder-icon" />
            <span>Sem foto</span>
          </div>
        )}

        {/* Botão Favoritar */}
        <button onClick={toggleFavorite} className="fav-btn">
          {isFavorited ? <HeartSolid className="icon-solid" /> : <HeartIcon className="icon-outline" />}
        </button>

        {/* Setas de Navegação */}
        {images.length > 1 && (
          <>
            <button onClick={handlePrevImage} className="nav-btn prev">
              <ChevronLeftIcon className="nav-icon" />
            </button>
            <button onClick={handleNextImage} className="nav-btn next">
              <ChevronRightIcon className="nav-icon" />
            </button>
            
            <div className="carousel-dots">
              {images.map((_: any, idx: number) => (
                <div 
                  key={idx} 
                  className={`dot ${idx === currentImageIndex ? 'active' : ''}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Conteúdo do Card */}
      <div className="card-content">
        
        <div className="card-header-info">
          <span className="property-type-badge">
            {translateType(property.type)}
          </span>
          <div className="card-price">
            {formattedPrice} <span className="price-period">/mês</span>
          </div>
        </div>

        <p className="card-location" title={`${property.address?.city}, ${property.address?.neighborhood}`}>
          <MapPinIcon className="location-icon" />
          {property.address?.city || "N/A"}, {property.address?.neighborhood || "Centro"}
        </p>

        <div className="card-features">
          <div className="feature-item">
            <span className="feature-value">{property.numberOfBedrooms || 0}</span> 
            <span className="feature-label">qtos</span>
          </div>
          <div className="feature-item">
            <span className="feature-value">{property.numberOfBathrooms || 0}</span> 
            <span className="feature-label">banh</span>
          </div>
          {property.garage && (
            <div className="feature-item">
              <span className="feature-value">1+</span> 
              <span className="feature-label">vaga</span>
            </div>
          )}
        </div>

        <div className="card-actions-grid">
          <button onClick={handleEdit} className="btn-action edit"> 
            Editar
          </button>
          
          {/*SELECT DE STATUS */}
          <select 
            className={`btn-action status-select ${getStatusColorClass(property.status)}`}
            value={property.status || 'ACTIVE'}
            onChange={handleStatusChange}
            onClick={(e) => e.stopPropagation()} 
            disabled={isUpdatingStatus}
          >
            <option value="ACTIVE">Ativo</option>
            <option value="PAUSED">Pausado</option>
            <option value="PLACED">Alugado</option>
          </select>
        </div>

      </div>
    </div>
  );
};