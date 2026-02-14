"use client";

import React, { useState } from 'react';
import { HeartIcon, ChevronLeftIcon, ChevronRightIcon, StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

interface Property {
  id: string;
  title: string;
  priceInCents: number;
  photoUrls: string[];
  type: string;
 
}

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard = ({ property }: PropertyCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Imagens: Se não tiver fotos, usa placeholder
  const images = property.photoUrls && property.photoUrls.length > 0 
    ? property.photoUrls 
    : ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070"]; // Placeholder

  // Formata preço
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(property.priceInCents / 100);

  // Lógica do Carrossel
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="property-card">
      
      {/* Imagem + Slider */}
      <div className="card-image-container">
        <img 
          src={images[currentImageIndex]} 
          alt={property.title} 
          className="card-img" 
        />
        
        {/* Setas só aparecem se tiver mais de 1 imagem */}
        {images.length > 1 && (
          <>
            <button className="carousel-btn left" onClick={prevImage}>
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <button className="carousel-btn right" onClick={nextImage}>
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Botão Favorito */}
        <button className="fav-btn">
          <HeartIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Conteúdo */}
      <div className="card-content">
        <h3 className="card-title">{property.title}</h3>
        <p className="card-price">{formattedPrice}</p>

        {/* Avaliação (Mockada visualmente conforme imagem) */}
        <div className="rating-container">
          {[1,2,3,4,5].map((star) => (
             <StarIconSolid key={star} className="star-icon" />
          ))}
          <span className="rating-text">(Novo)</span>
        </div>

        {/* Botão Editar */}
        <button className="edit-btn">
          Editar Anúncio
        </button>
      </div>
    </div>
  );
};