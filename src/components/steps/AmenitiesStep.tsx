"use client";

import React from 'react';

interface AmenitiesStepProps {
  data: any;
  updateData: (newData: any) => void;
  onNext: () => void;
}

const AMENITIES_LIST = [
  "Wifi", "Kitchen", "Washing Machine", "Dryer", 
  "Air Conditioning", "Heating", "Dedicated Workspace", 
  "TV", "Hair Dryer", "Iron", "Pool", "Free Parking", "Crib"
];

export const AmenitiesStep = ({ data, updateData, onNext }: AmenitiesStepProps) => {
  // Garantir que amenities seja um array
  const selectedAmenities = data.amenities || [];

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      updateData({ 
        amenities: selectedAmenities.filter((item: string) => item !== amenity) 
      });
    } else {
      updateData({ 
        amenities: [...selectedAmenities, amenity] 
      });
    }
  };

  return (
    <div className="step-container">
      <h2 className="step-inner-title">Amenities</h2>
      <p style={{ color: '#666', marginBottom: '30px', marginTop: '-30px' }}>
        Select the amenities available at your property.
      </p>

      <div className="amenities-grid">
        {AMENITIES_LIST.map((amenity) => (
          <div 
            key={amenity} 
            className={`amenity-item ${selectedAmenities.includes(amenity) ? 'selected' : ''}`}
            onClick={() => toggleAmenity(amenity)}
          >
            <input 
              type="checkbox" 
              className="amenity-checkbox"
              checked={selectedAmenities.includes(amenity)}
              readOnly
            />
            <span className="amenity-label">{amenity}</span>
          </div>
        ))}
      </div>

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