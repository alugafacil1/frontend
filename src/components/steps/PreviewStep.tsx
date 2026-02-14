"use client";

import React, { useMemo } from 'react';

interface PreviewStepProps {
  data: any;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean; 
}

export const PreviewStep = ({ data, onNext, onBack, isLoading }: PreviewStepProps) => {
  const images = data.images || [];

  const previewImages = useMemo(() => {
    return images.map((img: any) => {
      if (img instanceof File) {
        return URL.createObjectURL(img);
      }
      return img; 
    });
  }, [images]);

  const placeholderImg = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070";

  // Função auxiliar para formatar booleanos da API
  const formatBool = (val: any) => val ? "Sim" : "Não";

  return (
    <div className="step-container">
      <h2 className="step-inner-title">Pré-visualizar Anúncio</h2>
      <p className="step-description">
        Pré-visualize os detalhes do seu anúncio antes de finalizar.
      </p>

      {/* Seção de Imagens Estilo Grid Horizontal */}
      <div className="preview-section">
        <h4 className="section-title">Imagens</h4>
        <div className="image-preview-grid">
          {previewImages.length > 0 ? (
            previewImages.map((src: string, i: number) => (
              <div key={i} className="preview-card">
                <img src={src} alt={`Preview ${i}`} className="preview-img" />
              </div>
            ))
          ) : (
            <img src={placeholderImg} className="preview-img" style={{ borderRadius: '8px', width: '200px' }} />
          )}
        </div>
      </div>

      {/* Tabela de Detalhes Estilo Listagem */}
      <div className="preview-section">
        <h4 className="section-title">Detalhes do Imóvel</h4>
        <div className="preview-list-table">
          <div className="preview-table-row"><span>País</span><strong>Brasil</strong></div>
          <div className="preview-table-row"><span>Cidade</span><strong>{data.city || '-'}</strong></div>
          <div className="preview-table-row"><span>CEP</span><strong>{data.postalCode || '-'}</strong></div>
          <div className="preview-table-row"><span>Tipo de Imóvel</span><strong>{data.propertyType || '-'}</strong></div>
          <div className="preview-table-row"><span>Nº do Apto/Casa</span><strong>{data.number || '-'}</strong></div>
          <div className="preview-table-row"><span>Endereço</span><strong>{data.address || '-'}</strong></div>
          <div className="preview-table-row"><span>Nº de Quartos</span><strong>{data.rooms || '0'}</strong></div>
          <div className="preview-table-row"><span>Nº de Banheiros</span><strong>{data.bathrooms || '0'}</strong></div>
          
          <div className="preview-table-row"><span>Aluguel Mensal</span><strong>R${data.monthlyRent || '0'}</strong></div>
          <div className="preview-table-row"><span>Tempo Mínimo de Contrato</span><strong>{data.minTenancy || '-'} Meses</strong></div>
          <div className="preview-table-row"><span>Aluguel Semanal</span><strong>R${data.weeklyRent || '0'}</strong></div>
          <div className="preview-table-row"><span>Valor da Caução</span><strong>R${data.deposit || '0'}</strong></div>
          <div className="preview-table-row"><span>Disponível a partir de</span><strong>{data.moveInDate || '-'}</strong></div>
          <div className="preview-table-row"><span>Nº Máximo de Ocupantes</span><strong>{data.maxAttendants || '0'}</strong></div>

          {/* Seção de Contas Inclusas/Amenities */}
          <div className="preview-table-row highlight">
            <span>Contas Inclusas</span>
            <strong>{data.amenities?.join(", ") || "Nenhuma marcada"}</strong>
          </div>

          <div className="preview-table-row"><span>Mobiliado</span><strong>{formatBool(data.amenities?.includes("Mobiliado"))}</strong></div>
          <div className="preview-table-row"><span>Vaga de Garagem</span><strong>{formatBool(data.houseRules?.includes("Vaga de Garagem"))}</strong></div>
          <div className="preview-table-row"><span>Aceita Animais</span><strong>{formatBool(data.houseRules?.includes("Aceita Animais"))}</strong></div>
          
          <div className="preview-table-row highlight">
            <span>Descrição da Disponibilidade</span>
            <strong style={{ fontWeight: 'normal', fontSize: '13px' }}>{data.description || '-'}</strong>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="buttons-container">
        <button onClick={onBack} className="btn-back" disabled={isLoading}>
          Voltar
        </button>
        
        <button onClick={onNext} className="btn-next" disabled={isLoading} style={{ width: 'auto', minWidth: '200px' }}>
          {isLoading ? "Publicando..." : "Finalizar"}
        </button>
      </div>
    </div>
  );
};