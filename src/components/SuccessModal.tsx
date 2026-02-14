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
        {/* Círculo de ícone seguindo o padrão do projeto */}
        <div className="success-icon-circle">
          <CheckIcon className="success-check-icon" />
        </div>
        
        <h2 className="modal-title">Anúncio Publicado!</h2>
        <p className="modal-desc">
          Seu imóvel foi listado com sucesso. Agora ele está visível para potenciais inquilinos.
        </p>

        {/* Botão formatado como o btn-publish/btn-next */}
        <button onClick={onClose} className="btn-publish">
          Ir para o Dashboard
        </button>
      </div>
    </div>
  );
};