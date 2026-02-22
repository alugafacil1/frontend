"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { HeartIcon as HeartOutline, PhotoIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { propertyService } from "@/services/property/propertyService";

interface PropertyCardProps {
  property: any;
  onDeleteSuccess?: (id: string) => void;
}

export const PropertyCard = ({ property, onDeleteSuccess }: PropertyCardProps) => {
  const [imgError, setImgError] = useState(false);
  const [isFavorited, setIsFavorited] = useState(property.isFavorited || false);
  const [loadingFav, setLoadingFav] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const propertyId = property.id || property.propertyId;

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    if (loadingFav) return;

    setLoadingFav(true);
    const newState = !isFavorited;
    setIsFavorited(newState);

    try {
      console.log(`Imóvel favoritado: ${newState}`);
    } catch (error) {
      console.error("Erro ao favoritar", error);
      setIsFavorited(!newState); 
    } finally {
      setLoadingFav(false);
    }
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
      console.error(" Erro ao excluir imóvel:", error);
      alert("Não foi possível excluir o anúncio. Tente novamente.");
      setIsDeleting(false);
    }
  };

  const formattedPrice = Number(property.priceInCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  const hasImage = property.photoUrls && property.photoUrls.length > 0;
  const mainImage = hasImage ? property.photoUrls[0] : null;

  const translateType = (type: string) => {
    const types: Record<string, string> = { APARTMENT: 'Apartamento', HOUSE: 'Casa', ROOM: 'Quarto' };
    return types[type] || type || 'Imóvel';
  };

  return (
    <div className={`property-card ${isDeleting ? 'is-deleting' : ''}`}>
      
      <div className="card-image-container">
        {!imgError && mainImage ? (
          <img 
            src={mainImage} 
            alt="Imagem do imóvel" 
            className="card-img"
            onError={() => setImgError(true)} 
          />
        ) : (
          <div className="no-image-placeholder">
            <PhotoIcon style={{ width: '48px', height: '48px', marginBottom: '8px', opacity: 0.5 }} />
            <span>Sem foto</span>
          </div>
        )}

        <button onClick={toggleFavorite} className="fav-btn" disabled={loadingFav}>
          {isFavorited ? (
            <HeartSolid style={{ width: '20px', height: '20px', color: '#ef4444' }} />
          ) : (
            <HeartOutline style={{ width: '20px', height: '20px' }} />
          )}
        </button>
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
          <MapPinIcon style={{ width: '16px', height: '16px', marginRight: '4px', flexShrink: 0 }} />
          {property.address?.city || "Cidade não informada"}, {property.address?.neighborhood || "Centro"}
        </p>

        <div className="card-features">
          <div className="feature-item">
            {property.numberOfBedrooms || 0} <span className="feature-label">qtos</span>
          </div>
          <div className="feature-item">
            {property.numberOfBathrooms || 0} <span className="feature-label">banh</span>
          </div>
          {property.garage && (
            <div className="feature-item">
              1+ <span className="feature-label">vaga</span>
            </div>
          )}
        </div>

        <div className="card-actions-grid">
          <Link href={`/ads/edit/${propertyId}`} className="btn-action edit"> 
            Editar
          </Link>
          <button onClick={handleDelete} className="btn-action delete">
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>

      </div>
    </div>
  );
};