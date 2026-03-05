"use client";
import React from 'react';

interface AmenitiesStepProps {
  data: any;
  updateData: (newData: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const AMENITIES_LIST = [
  "Água", 
  "Luz", 
  "IPTU", 
  "Gás", 
  "Internet", 
  "Condomínio",
  "Mobiliado",
  "Ar Condicionado",
  "Garagem"
];

export const AmenitiesStep = ({ data, updateData, onNext, onBack }: AmenitiesStepProps) => {
  
  const selectedAmenities = data.amenities || [];

  const toggleAmenity = (amenity: string) => {
    let newAmenities;
    
    if (selectedAmenities.includes(amenity)) {
      newAmenities = selectedAmenities.filter((item: string) => item !== amenity);
    } else {
      newAmenities = [...selectedAmenities, amenity];
    }

    updateData({ amenities: newAmenities });
  };

  return (
    <div className="step-container">
      <h2 className="step-inner-title">Detalhes do Imóvel/Quarto</h2>
      <p className="step-description">
        Marque o que já está pago no valor mensal
      </p>

      <div className="amenities-list">
        {AMENITIES_LIST.map((amenity) => {
          const isSelected = selectedAmenities.includes(amenity);
          
          return (
            <div 
              key={amenity} 
              className={`amenity-row ${isSelected ? 'selected' : ''}`}
              onClick={() => toggleAmenity(amenity)}
            >
              <span className="amenity-name">
                {amenity}
              </span>

              {/* Toggle Switch */}
              <div className={`toggle-switch ${isSelected ? 'active' : ''}`}>
                <div className="toggle-thumb"></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="buttons-container">
        <button onClick={onBack} className="btn-back">
          Voltar
        </button>
        
        <button onClick={onNext} className="btn-next">
          Próximo
        </button>
      </div>
    </div>
  );
};