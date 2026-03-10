"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  HeartIcon, 
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
  const images = property.photoUrls && property.photoUrls.length > 0 ? property.photoUrls : [];

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
      if (onUpdateSuccess) onUpdateSuccess();
      else window.location.reload();
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

  // Define o título baseado nos dados da API (fallback para o Tipo se não tiver título)
  const displayTitle = property.title || property.name || `${translateType(property.type)} ${propertyId ? propertyId.toString().substring(0,3) : ''}`;

  return (
    <div 
      className={`property-card-minimal ${isUpdatingStatus ? 'is-updating' : ''}`} 
      onClick={handleCardClick}
    >
      <div className="card-img-wrapper">
        {images.length > 0 && !imgError ? (
          <img 
            src={images[currentImageIndex]} 
            alt={displayTitle} 
            className="card-img-minimal"
            onError={() => setImgError(true)} 
          />
        ) : (
          <div className="no-img-minimal">
            <PhotoIcon className="w-10 h-10 opacity-40 mb-2" />
            <span>Sem foto</span>
          </div>
        )}

        <button onClick={toggleFavorite} className="btn-fav-minimal">
          {isFavorited ? <HeartSolid className="w-5 h-5 text-red-500" /> : <HeartIcon className="w-5 h-5 text-gray-600" />}
        </button>

        {images.length > 1 && (
          <>
            <button onClick={handlePrevImage} className="btn-nav-minimal prev">
              <ChevronLeftIcon className="w-4 h-4 text-gray-700" />
            </button>
            <button onClick={handleNextImage} className="btn-nav-minimal next">
              <ChevronRightIcon className="w-4 h-4 text-gray-700" />
            </button>
          </>
        )}
      </div>

      <div className="card-body-minimal">
        <div className="card-info-left">
          <h3 className="card-title-minimal">{displayTitle}</h3>
          <span className="card-price-minimal">{formattedPrice}</span>
        </div>

        {canManageProperty && (
          <div className="card-actions-right">
            <button onClick={handleEdit} className="btn-edit-minimal"> 
              Editar Imóvel
            </button>
            
            {/* O Select de Status foi mantido para não quebrar a funcionalidade, mas estilizado de forma discreta */}
            <select 
              className="select-status-minimal"
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