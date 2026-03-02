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
  const [isFavorited, setIsFavorited] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  const propertyId = property.id || property.propertyId;
  const images = property.photoUrls && property.photoUrls.length > 0 
    ? property.photoUrls 
    : [];

  useEffect(() => {
    async function checkFavoriteStatus() {
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

  
  const isAgencyAdmin = user?.role === 'AGENCY_ADMIN';
  const canManageProperty = user?.role === 'OWNER' || user?.role === 'REALTOR' || isAgencyAdmin;

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
    
    if (!user || !user.id) {
      alert("Você precisa estar logado para favoritar um imóvel.");
      return; 
    }
    
    const previousState = isFavorited;
    setIsFavorited(!previousState);
    
    try {
      const response = await propertyService.toggleFavorite(user.id, propertyId);
      setIsFavorited(response.isFavorited); 
    } catch (error) {
      console.error("Erro ao favoritar", error);
      setIsFavorited(previousState); 
      alert("Erro ao favoritar o imóvel.");
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newStatus = e.target.value;

    if (!window.confirm("Deseja realmente alterar o status deste anúncio?")) {
      e.target.value = property.status; 
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
      e.target.value = property.status; 
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

  const getStatusColorClass = (status: string) => {
    switch(status) {
      case 'ACTIVE': return 'status-active';
      case 'PAUSED': return 'status-paused';
      case 'PLACED': return 'status-placed';
      case 'PENDING': return 'status-pending';
      case 'REJECTED': return 'status-rejected'; 
      default: return '';
    }
  };

  return (
    <div 
      className={`property-card ${isUpdatingStatus ? 'is-updating' : ''}`} 
      onClick={handleCardClick}
    >
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

        <button onClick={toggleFavorite} className="fav-btn">
          {isFavorited ? <HeartSolid className="icon-solid" /> : <HeartIcon className="icon-outline" />}
        </button>

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

        {canManageProperty && (
          <div className="card-actions-grid">
            <button onClick={handleEdit} className="btn-action edit"> 
              Editar
            </button>
            
            <select 
              className={`btn-action status-select ${getStatusColorClass(property.status)}`}
              value={property.status || 'ACTIVE'}
              onChange={handleStatusChange}
              onClick={(e) => e.stopPropagation()} 
              
              disabled={isUpdatingStatus || (property.status === 'PENDING' && !isAgencyAdmin)}
            >
              <option value="ACTIVE">Ativo</option>
              <option value="PAUSED">Pausado</option>
              <option value="PLACED">Alugado</option>
              <option value="PENDING" disabled={property.status !== 'PENDING'}>Pendente</option>
              
              {(isAgencyAdmin || property.status === 'REJECTED') && (
                <option value="REJECTED">Rejeitado</option>
              )}
            </select>
          </div>
        )}

      </div>
    </div>
  );
};