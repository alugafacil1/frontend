"use client";

import React, { useRef } from 'react';
import { PhotoIcon, XMarkIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";

interface MediaStepProps {
  data: any;
  updateData: (newData: any) => void;
  onNext: () => void;
  onBack: () => void; 
}

export const MediaStep = ({ data, updateData, onNext, onBack }: MediaStepProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const images: File[] = data.images || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      updateData({ images: [...images, ...newFiles] });
    }
  };

  const removeImage = (indexToRemove: number) => {
    const filteredImages = images.filter((_, index) => index !== indexToRemove);
    updateData({ images: filteredImages });
  };

  return (
    <div className="step-container">
      <h2 className="step-inner-title">Detalhes do Imóvel/Quarto</h2>
      <p className="step-description">
        Envie fotos do seu imóvel
      </p>
      
      
      <div 
        className="upload-box" 
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-content">
          <ArrowUpTrayIcon className="upload-icon-blue" />
          <p className="upload-main-text">Arraste ou Carregue a Imagem</p>
          <p className="upload-subtext-small">
            Formatos permitidos: JPG, JPEG, PNG <br />
            tamanho da imagem deve ser de 10kb a 20mb
          </p>
          <button type="button" className="btn-browse">Browse</button>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          multiple 
          hidden 
          accept="image/*"
        />
      </div>

      {/* Grid de Preview das Imagens Carregadas */}
      {images.length > 0 && (
        <div className="image-preview-grid">
          {images.map((file, index) => (
            <div key={index} className="preview-card">
              <img 
                src={URL.createObjectURL(file)} 
                alt={`Preview ${index}`} 
                className="preview-img" 
              />
              <button 
                className="remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
              >
                <XMarkIcon className="remove-icon" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Campo do Link do YouTube */}
      <div className="floating-input-container">
        <label className="floating-label">Link do YouTube (Opcional)</label>
        <input 
          type="text" 
          className="custom-input"
          placeholder="Cole o link"
          value={data.videoLink || ''}
          onChange={(e) => updateData({ videoLink: e.target.value })}
        />
      </div>

      {/* Botões de Navegação */}
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