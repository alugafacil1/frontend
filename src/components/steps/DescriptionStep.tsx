"use client";
import React from 'react';

export const DescriptionStep = ({ data, updateData, onNext }: any) => {
  return (
    <div className="step-container">
      <h2 className="step-inner-title">Property/ Room Details</h2>
      
      <div className="media-input-group">
        <label className="media-label">Ad Title</label>
        <input 
          type="text" 
          className="media-input"
          placeholder="e.g. Modern 2-bedroom apartment in London"
          value={data.title}
          onChange={(e) => updateData({ title: e.target.value })}
        />
      </div>

      <div className="media-input-group" style={{ marginTop: '30px' }}>
        <label className="media-label">Description</label>
        <textarea 
          className="media-textarea"
          placeholder="Describe your property, rules, and neighborhood..."
          value={data.description}
          onChange={(e) => updateData({ description: e.target.value })}
          style={{ minHeight: '200px' }}
        />
      </div>

      <div className="button-wrapper">
        <button onClick={onNext} className="btn-next">Next</button>
      </div>
    </div>
  );
};