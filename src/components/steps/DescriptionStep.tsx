"use client";
import React from 'react';

interface DescriptionStepProps {
  data: any;
  updateData: (newData: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export const DescriptionStep = ({ data, updateData, onNext, onBack }: DescriptionStepProps) => {
  
  const isVirtualTour = data.virtualTour || false;

  const toggleVirtualTour = () => {
    updateData({ virtualTour: !isVirtualTour });
  };

  const isValid = data.description?.trim().length > 0;

  return (
    <div className="step-container">
      <h2 className="step-inner-title">Detalhes do Imóvel/Quarto</h2>
      <p className="step-description">
        Informe aos inquilinos se você pode mostrar o imóvel por vídeo caso eles não possam estar presentes fisicamente.
      </p>
      
      <div className="description-fields-wrapper">
        
        {/* Toggle Visita Virtual - Usando classes do CSS global */}
        <div 
          className={`amenity-row ${isVirtualTour ? 'selected' : ''}`}
          onClick={toggleVirtualTour}
        >
          <span className="amenity-name">
            Visita Virtual
          </span>

          
          <div className={`toggle-switch ${isVirtualTour ? 'active' : ''}`}>
            <div className="toggle-thumb"></div>
          </div>
        </div>

        {/* Campo de Texto Grande */}
        <div className="floating-input-container">
            <label className="floating-label">Descrição da Disponibilidade</label>
            <textarea 
                className="custom-input textarea-compact"
                placeholder=""
                value={data.description || ''}
                onChange={(e) => updateData({ description: e.target.value })}
                maxLength={1000}
            />
        </div>

      </div>

      <div className="buttons-container">
        <button onClick={onBack} className="btn-back">
          Voltar
        </button>
        
        <button 
          onClick={onNext} 
          className="btn-next"
          disabled={!isValid}
        >
          Próximo
        </button>
      </div>
    </div>
  );
};