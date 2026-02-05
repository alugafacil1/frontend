"use client";

import React from 'react';

export const PreviewStep = ({ data, onNext }: any) => {
  const images = data.images || [];
  
  // Imagens mockadas apenas para preencher o visual se estiver vazio
  const placeholderImg = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070";

  return (
    <div className="step-container" style={{ maxWidth: '1000px' }}>
      <h2 className="step-inner-title">Preview Listing</h2>

      <div className="preview-main-layout">
        
        {/* COLUNA DA ESQUERDA: GALERIA */}
        <div className="preview-gallery-side">
          <img src={images[0] || placeholderImg} alt="Main" className="main-img-large" />
          
          <div className="secondary-images-grid">
            <img src={images[1] || placeholderImg} alt="Detail 1" className="sec-img" />
            <img src={images[2] || placeholderImg} alt="Detail 2" className="sec-img" />
          </div>
        </div>

        {/* COLUNA DA DIREITA: TEXTO E INFO */}
        <div className="preview-content-side">
          <div className="preview-header">
            <h3 className="preview-title" style={{ marginTop: 0 }}>
              {data.title || "Spacious Modern Property"}
            </h3>
            <p className="description-text">
              {data.description || "No description provided yet."}
            </p>
          </div>

          <div className="preview-list">
            <div className="preview-row">
              <span className="preview-label">Monthly Rent</span>
              <span className="preview-value">£{data.monthlyRent || '0'}</span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Location</span>
              <span className="preview-value">{data.city || 'Not set'}</span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Property Type</span>
              <span className="preview-value">{data.propertyType || 'Not set'}</span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Rooms</span>
              <span className="preview-value">{data.rooms || '0'} Bed</span>
            </div>
          </div>

          <div className="button-wrapper" style={{ marginTop: '30px' }}>
            <button onClick={onNext} className="btn-next" style={{ width: '100%' }}>
              Publish Listing
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};