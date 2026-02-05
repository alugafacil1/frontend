"use client";
import React from 'react';

export const HouseRulesStep = ({ data, updateData, onNext }: any) => {
  const rules = data.houseRules || [];
  const toggle = (item: string) => {
    const nextRules = rules.includes(item) 
      ? rules.filter((i: string) => i !== item) 
      : [...rules, item];
    updateData({ houseRules: nextRules });
  };

  return (
    <div className="step-container">
      <h2 className="step-inner-title">Property/ Room Details</h2>
      <div className="amenities-section">
        <span className="section-label">House Rules</span>
        <div className="amenities-list-flex">
          {["Pets Allowed", "Smoking Allowed", "Students Allowed", "Families Allowed"].map((item) => (
            <label key={item} className="amenity-option">
              <input 
                type="checkbox" 
                checked={rules.includes(item)}
                onChange={() => toggle(item)}
              />
              <span className="amenity-text">{item}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="button-wrapper">
        <button onClick={onNext} className="btn-next">Next</button>
      </div>
    </div>
  );
};