"use client";

import React, { useRef } from 'react';
import { PhotoIcon, XMarkIcon, VideoCameraIcon } from "@heroicons/react/24/outline";

interface MediaStepProps {
  data: any;
  updateData: (newData: any) => void;
  onNext: () => void;
}

export const MediaStep = ({ data, updateData, onNext }: MediaStepProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      updateData({ images: [...(data.images || []), ...newImages] });
    }
  };

  const removeImage = (indexToRemove: number) => {
    const filteredImages = data.images.filter((_: any, index: number) => index !== indexToRemove);
    updateData({ images: filteredImages });
  };

  return (
    <div className="step-container">
      <h2 className="step-inner-title">Property/ Room Details</h2>
      
      {/* Upload de Fotos */}
      <div className="media-input-group">
        <label className="media-label">Photos of the Property</label>
        <div className="upload-container" onClick={() => fileInputRef.current?.click()}>
          <PhotoIcon className="upload-icon" style={{ margin: '0 auto' }} />
          <p className="upload-text">
            <span>Click to upload</span> or drag and drop images here
          </p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            multiple 
            hidden 
            accept="image/*"
          />
        </div>
      </div>

      {/* Preview das imagens */}
      {data.images?.length > 0 && (
        <div className="image-preview-grid" style={{ marginTop: '20px', marginBottom: '40px' }}>
          {data.images.map((img: string, index: number) => (
            <div key={index} style={{ position: 'relative' }}>
              <img src={img} alt="Preview" className="preview-item" />
              <button 
                className="remove-image-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
              >
                <XMarkIcon style={{ width: '14px', color: 'white' }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Campo do Link do YouTube - O que faltava */}
      <div className="media-input-group" style={{ marginTop: '20px' }}>
        <label className="media-label">Video Link (YouTube)</label>
        <div style={{ position: 'relative' }}>
          <input 
            type="text" 
            className="media-input"
            placeholder="Paste your YouTube video link here"
            style={{ paddingLeft: '45px' }} // Espaço para o ícone
            value={data.videoLink || ''}
            onChange={(e) => updateData({ videoLink: e.target.value })}
          />
          <VideoCameraIcon 
            style={{ 
              position: 'absolute', 
              left: '15px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              width: '20px',
              color: '#9ca3af'
            }} 
          />
        </div>
      </div>

      <div className="button-wrapper">
        <button onClick={onNext} className="btn-next">Next</button>
      </div>
    </div>
  );
};