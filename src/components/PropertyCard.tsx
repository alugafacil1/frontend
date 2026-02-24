"use client";

import React, { useState } from 'react';
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

// Importe o CSS aqui (se estiver usando modules ou global)
import "@/assets/styles/property/MyProperties.css"; 

interface PropertyCardProps {
  property: any;
  onDeleteSuccess?: (id: string) => void;
}

export const PropertyCard = ({ property, onDeleteSuccess }: PropertyCardProps) => {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [isFavorited, setIsFavorited] = useState(property.isFavorited || false);
  const [isDeleting, setIsDeleting] = useState(false);

  const propertyId = property.id || property.propertyId;

  // Garante uma lista válida de imagens ou fallback
  const images = property.photoUrls && property.photoUrls.length > 0 
    ? property.photoUrls 
    : [];

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
    setIsFavorited(!isFavorited);
    // Aqui você chamaria o serviço para persistir o favorito no backend
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Tem certeza que deseja excluir este anúncio permanentemente?")) {
      return;
    }

    setIsDeleting(true);

    try {
      await propertyService.delete(propertyId);
      if (onDeleteSuccess) {
        onDeleteSuccess(propertyId);
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Erro ao excluir imóvel:", error);
      alert("Não foi possível excluir o anúncio.");
      setIsDeleting(false);
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

  return (
    <div 
      className={`property-card ${isDeleting ? 'is-deleting' : ''}`} 
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

        {/* Setas de Navegação (Só exibe se tiver > 1 foto) */}
        {images.length > 1 && (
          <>
            <button onClick={handlePrevImage} className="nav-btn prev">
              <ChevronLeftIcon className="nav-icon" />
            </button>
            <button onClick={handleNextImage} className="nav-btn next">
              <ChevronRightIcon className="nav-icon" />
            </button>
            
            {/* Indicador de pontos (Dots) */}
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
          <button onClick={handleDelete} className="btn-action delete" disabled={isDeleting}>
            {isDeleting ? '...' : 'Excluir'}
          </button>
        </div>

      </div>
    </div>
  );
};