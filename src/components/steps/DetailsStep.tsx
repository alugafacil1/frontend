"use client";

import { FloatingInput } from "../FloatingInput";

interface DetailsStepProps {
  data: any;
  updateData: (newData: any) => void;
  onNext: () => void;
}

export const DetailsStep = ({ data, updateData, onNext }: DetailsStepProps) => {
  return (
    <div className="step-container">
      {/* Título interno conforme a imagem */}
      <h2 className="step-inner-title">
        Property/ Room Details
      </h2>

      {/* Grid de Inputs usando CSS Puro */}
      <div className="details-grid">
        <FloatingInput 
          label="Select Country" 
          isSelect 
          value={data.country}
          onChange={(e) => updateData({ country: e.target.value })}
        />
        <FloatingInput 
          label="Select City" 
          isSelect 
          value={data.city}
          onChange={(e) => updateData({ city: e.target.value })}
        />

        <FloatingInput 
          label="Postal Code" 
          value={data.postalCode}
          onChange={(e) => updateData({ postalCode: e.target.value })}
        />
        <FloatingInput 
          label="Property Type" 
          isSelect 
          value={data.propertyType}
          onChange={(e) => updateData({ propertyType: e.target.value })}
        />

        <FloatingInput 
          label="Flat/House Number" 
          value={data.number}
          onChange={(e) => updateData({ number: e.target.value })}
        />
        <FloatingInput 
          label="Address" 
          value={data.address}
          onChange={(e) => updateData({ address: e.target.value })}
        />

        <FloatingInput 
          label="Number of Bedrooms" 
          type="number"
          value={data.rooms}
          onChange={(e) => updateData({ rooms: e.target.value })}
        />
        <FloatingInput 
          label="Number of Bathrooms" 
          type="number"
          value={data.bathrooms}
          onChange={(e) => updateData({ bathrooms: e.target.value })}
        />
      </div>

      {/* Botão de ação principal */}
      <div className="button-wrapper">
        <button 
          onClick={onNext}
          className="btn-next"
        >
          Next
        </button>
      </div>
    </div>
  );
};