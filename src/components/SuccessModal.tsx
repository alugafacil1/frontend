"use client";

import React from 'react';
import { CheckIcon } from "@heroicons/react/24/outline";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuccessModal = ({ isOpen, onClose }: SuccessModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="success-icon-circle">
          <CheckIcon style={{ width: '40px' }} />
        </div>
        
        <h2 className="modal-title">Listing Published!</h2>
        <p className="modal-desc">
          Your property has been successfully listed. It is now visible to thousands of potential tenants.
        </p>

        <button onClick={onClose} className="btn-finish">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};