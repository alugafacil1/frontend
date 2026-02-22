"use client";

import React, { useMemo } from 'react';
import { useMasks } from "../../../hooks/useMasks";

interface PreviewStepProps {
  data: any;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean; 
}

export const PreviewStep = ({ data, onNext, onBack, isLoading }: PreviewStepProps) => {
  // 1. Usando o Hook centralizado para todas as formatações
  const { 
    formatCurrency, 
    formatDate, 
    formatBool, 
    translateType 
  } = useMasks();

  // 2. Lógica de Imagens (Arquivos vs URLs)
  const images = data.images || [];
  const previewImages = useMemo(() => {
    return images.map((img: any) => {
      if (img instanceof File) {
        return URL.createObjectURL(img);
      }
      return img; 
    });
  }, [images]);

  // 3. Helper para verificar arrays (Amenities/Regras)
  const hasItem = (list: string[] | undefined, item: string) => list?.includes(item);

  return (
    <div className="step-container">
      <h2 className="step-inner-title">Pré-visualizar Anúncio</h2>
      <p className="step-description">
        Confira todos os detalhes abaixo antes de publicar o seu imóvel.
      </p>

      {/* --- SEÇÃO 1: IMAGENS --- */}
      <div className="preview-section">
        <h4 className="preview-title">Imagens ({previewImages.length})</h4>
        <div className="image-preview-grid">
          {previewImages.length > 0 ? (
            previewImages.map((src: string, i: number) => (
              <div key={i} className="preview-card">
                <img src={src} alt={`Preview ${i}`} className="preview-img" />
              </div>
            ))
          ) : (
            <div className="upload-box" style={{ cursor: 'default' }}>
              <span className="upload-text">Nenhuma imagem selecionada</span>
            </div>
          )}
        </div>
      </div>

      {/* --- SEÇÃO 2: DETALHES GERAIS --- */}
      <div className="preview-section">
        <div className="preview-header">
           <h4 className="preview-title">Dados do Imóvel</h4>
        </div>
        
        <div className="preview-list-table">
          {/* Localização */}
          <div className="preview-table-row">
            <span>País</span>
            <strong>{data.country || "Brasil"}</strong>
          </div>
          <div className="preview-table-row">
            <span>Cidade</span>
            <strong>{data.city || '-'}</strong>
          </div>
          <div className="preview-table-row">
            <span>Endereço</span>
            <strong>{data.address ? `${data.address}, ${data.number || 'S/N'}` : '-'}</strong>
          </div>
          <div className="preview-table-row">
            <span>CEP</span>
            <strong>{data.postalCode || '-'}</strong>
          </div>

          {/* Características */}
          <div className="preview-table-row">
            <span>Tipo de Imóvel</span>
            <strong>{translateType(data.propertyType)}</strong>
          </div>
          <div className="preview-table-row">
            <span>Quartos</span>
            <strong>{data.rooms || '0'}</strong>
          </div>
          <div className="preview-table-row">
            <span>Banheiros</span>
            <strong>{data.bathrooms || '0'}</strong>
          </div>
          <div className="preview-table-row">
            <span>Máx. Ocupantes</span>
            <strong>{data.maxAttendants || '0'} Pessoas</strong>
          </div>
        </div>
      </div>

      {/* --- SEÇÃO 3: FINANCEIRO E CONTRATO --- */}
      <div className="preview-section">
        <div className="preview-header">
           <h4 className="preview-title">Valores e Condições</h4>
        </div>

        <div className="preview-list-table">
          <div className="preview-table-row highlight">
            <span>Aluguel Mensal</span>
            <strong>{formatCurrency(data.monthlyRent)}</strong>
          </div>
          
          {data.weeklyRent && (
            <div className="preview-table-row">
              <span>Aluguel Semanal</span>
              <strong>{formatCurrency(data.weeklyRent)}</strong>
            </div>
          )}

          <div className="preview-table-row">
            <span>Valor da Caução</span>
            <strong>{formatCurrency(data.deposit)}</strong>
          </div>

          <div className="preview-table-row">
            <span>Contrato Mínimo</span>
            <strong>{data.minTenancy || '0'} Meses</strong>
          </div>

          <div className="preview-table-row">
            <span>Disponível a partir de</span>
            <strong>{formatDate(data.moveInDate)}</strong>
          </div>
        </div>
      </div>

      {/* --- SEÇÃO 4: COMODIDADES E REGRAS --- */}
      <div className="preview-section">
        <div className="preview-header">
           <h4 className="preview-title">Comodidades e Regras</h4>
        </div>
        
        <div className="preview-list-table">
          {/* Booleanos Principais */}
          <div className="preview-table-row">
            <span>Mobiliado?</span>
            <strong>{formatBool(hasItem(data.amenities, "Mobiliado"))}</strong>
          </div>
          <div className="preview-table-row">
            <span>Vaga de Garagem?</span>
            <strong>{formatBool(hasItem(data.amenities, "Vaga de Garagem"))}</strong>
          </div>
          <div className="preview-table-row">
            <span>Aceita Animais?</span>
            <strong>{formatBool(hasItem(data.houseRules, "Aceita Animais"))}</strong>
          </div>
          <div className="preview-table-row">
            <span>Aceita Fumantes?</span>
            <strong>{formatBool(hasItem(data.houseRules, "Permitido Fumar"))}</strong>
          </div>
          <div className="preview-table-row">
            <span>Aceita Casais?</span>
            <strong>{formatBool(hasItem(data.houseRules, "Aceita Casais"))}</strong>
          </div>

          {/* Listas Completas */}
          <div className="preview-table-row">
            <span>Itens Inclusos</span>
            <strong>{data.amenities?.length > 0 ? data.amenities.join(", ") : "Nenhum"}</strong>
          </div>
          
          <div className="preview-table-row">
            <span>Regras da Casa</span>
            <strong>{data.houseRules?.length > 0 ? data.houseRules.join(", ") : "Nenhuma"}</strong>
          </div>
        </div>
      </div>

      {/* --- SEÇÃO 5: DESCRIÇÃO --- */}
      <div className="preview-section">
        <div className="preview-header">
           <h4 className="preview-title">Descrição do Anúncio</h4>
        </div>
        
        <div className="custom-input textarea-compact" style={{ height: 'auto', minHeight: '100px', cursor: 'default' }}>
          {data.description || "Nenhuma descrição fornecida."}
        </div>
      </div>

      {/* --- BOTÕES DE AÇÃO --- */}
      <div className="buttons-container">
        <button 
          onClick={onBack} 
          className="btn-back" 
          disabled={isLoading}
        >
          Voltar e Editar
        </button>
        
        <button 
          onClick={onNext} 
          className="btn-next" 
          disabled={isLoading}
        >
          {isLoading ? "Publicando..." : "Confirmar e Publicar"}
        </button>
      </div>
    </div>
  );
};