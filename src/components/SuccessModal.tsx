"use client";

import React from 'react';
import { CheckIcon } from "@heroicons/react/24/outline";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing?: boolean;
}

export const SuccessModal = ({ isOpen, onClose, isEditing = false }: SuccessModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="success-icon-circle">
          <CheckIcon className="success-check-icon" />
        </div>
        
        <h2 className="modal-title">
          {isEditing ? "Anúncio Atualizado!" : "Anúncio Publicado!"}
        </h2>
        <p className="modal-desc">
          {isEditing 
            ? "As alterações no seu imóvel foram salvas com sucesso no Aluga Fácil." 
            : "Seu imóvel foi listado com sucesso. Agora ele está visível para inquilinos."
          }
        </p>

        <button onClick={onClose} className="btn-publish">
          {isEditing ? "Voltar aos Meus Imóveis" : "Ir para o Dashboard"}
        </button>
      </div>
    </div>
  );
};