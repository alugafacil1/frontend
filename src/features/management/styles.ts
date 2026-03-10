import styled from "styled-components";

// ==========================================
// ESTRUTURA DA PÁGINA E TÍTULOS (Base)
// ==========================================
export const PageContainer = styled.div`
    padding: 1rem 0 2rem 0; /* Removemos o calc(80px + 2rem) que causava o espaço */
    max-width: 1200px;
    margin: 0 auto;
    /* Removido o min-height para não forçar a tela a esticar desnecessariamente */
    font-family: 'Inter', sans-serif;
    background-color: transparent;
`;

export const TitleSection = styled.section`
    margin-bottom: 2.5rem;
    
    h1 { 
        color: #111827; 
        font-size: 1.875rem; 
        font-weight: 700;
        letter-spacing: -0.025em;
        margin-bottom: 0.5rem;
    }
    
    p { 
        color: #6b7280; 
        font-size: 0.95rem;
    }
    
    strong { 
        color: #3b82f6; 
        font-weight: 600;
    }
`;

export const TabsContainer = styled.div`
    display: flex;
    gap: 32px;
    border-bottom: 2px solid #f3f4f6;
    margin-bottom: 2rem;
`;

export const TabButton = styled.button<{ $active: boolean }>`
    background: none;
    border: none;
    padding: 0 0 12px 0;
    font-size: 1rem;
    font-weight: 600;
    color: ${props => props.$active ? "#3b82f6" : "#9ca3af"};
    border-bottom: 3px solid ${props => props.$active ? "#3b82f6" : "transparent"};
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: -2px;

    &:hover {
        color: ${props => props.$active ? "#3b82f6" : "#4b5563"};
    }
`;

export const ContentSection = styled.section`
    background: #ffffff;
    width: 100%;
`;

// ==========================================
// COMPONENTES ORIGINAIS (USUÁRIOS E AGÊNCIAS) - INTOCADOS!
// ==========================================
export const TabsHeader = styled.div`
    display: flex;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 1.5rem;
    padding: 0 2rem;
`;

export const TabButtonModal = styled.button<{ $active?: boolean }>`
    background: none;
    border: none;
    padding: 1rem 1.5rem;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    color: ${({ $active }) => ($active ? '#2563eb' : '#6b7280')};
    border-bottom: 2px solid ${({ $active }) => ($active ? '#2563eb' : 'transparent')};
    transition: all 0.2s;

    &:hover {
        color: #2563eb;
    }
`;

export const FeatureGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
    background: #f9fafb;
    padding: 1rem;
    border-radius: 0.5rem;
`;

export const FeatureItem = styled.div`
    display: flex;
    flex-direction: column;
    
    span.label {
        font-size: 0.75rem;
        color: #6b7280;
        text-transform: uppercase;
        font-weight: 600;
    }
    span.value {
        font-size: 1rem;
        color: #111827;
        font-weight: 500;
    }
`;

export const DescriptionBox = styled.div`
    margin-top: 1.5rem;
    p {
        color: #4b5563;
        font-size: 0.95rem;
        line-height: 1.5;
        white-space: pre-wrap;
    }
`;

// ==========================================
// FILTROS E TABELA PRINCIPAL (IMÓVEIS)
// ==========================================
export const FilterContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 2rem;
    flex-wrap: wrap;
`;

export const FilterLabel = styled.span`
    font-weight: 700;
    color: #374151;
    font-size: 0.95rem;
    margin-right: 8px;
`;

export const FilterPill = styled.button<{ $active?: boolean }>`
    padding: 8px 24px;
    border-radius: 24px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid ${props => props.$active ? "#3b82f6" : "#e5e7eb"};
    background-color: ${props => props.$active ? "#3b82f6" : "#ffffff"};
    color: ${props => props.$active ? "#ffffff" : "#6b7280"};
    transition: all 0.2s ease;

    &:hover {
        background-color: ${props => props.$active ? "#2563eb" : "#f9fafb"};
        border-color: ${props => props.$active ? "#2563eb" : "#d1d5db"};
    }
`;

export const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    text-align: left;
`;

export const Th = styled.th`
    padding: 16px;
    color: #6b7280;
    font-weight: 600;
    font-size: 0.85rem;
    border-bottom: 1px solid #e5e7eb;
`;

export const Td = styled.td`
    padding: 16px;
    border-bottom: 1px solid #f8fafc; 
    vertical-align: middle;
    color: #4b5563;
    font-size: 0.9rem;
`;

export const PropertyCell = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    font-weight: 600;
    color: #111827;

    img {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        object-fit: cover;
        background-color: #f3f4f6;
    }
`;

export const ActionButton = styled.button`
    background-color: #f3f4f6;
    border: none;
    padding: 6px 20px;
    border-radius: 20px;
    color: #9ca3af;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background-color: #e5e7eb;
        color: #4b5563;
    }
`;

export const StatusBadge = styled.span<{ $status?: string }>`
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    display: inline-block;
    text-align: center;
    min-width: 90px;
    
    background: ${props => {
        const s = props.$status?.toUpperCase();
        if (s === 'PENDENTE' || s === 'PENDING') return '#eff6ff'; 
        if (s === 'ATIVO' || s === 'ACTIVE') return '#eff6ff'; 
        if (s === 'PAUSADO' || s === 'PAUSED') return '#fff7ed'; 
        if (s === 'ALUGADO' || s === 'PLACED') return '#fef3c7'; 
        if (s === 'REJEITADO' || s === 'REJECTED') return '#fee2e2'; 
        return '#f3f4f6';
    }};
    
    color: ${props => {
        const s = props.$status?.toUpperCase();
        if (s === 'PENDENTE' || s === 'PENDING') return '#3b82f6'; 
        if (s === 'ATIVO' || s === 'ACTIVE') return '#3b82f6'; 
        if (s === 'PAUSADO' || s === 'PAUSED') return '#ea580c'; 
        if (s === 'ALUGADO' || s === 'PLACED') return '#d97706'; 
        if (s === 'REJEITADO' || s === 'REJECTED') return '#ef4444'; 
        return '#4b5563';
    }};
`;

// ==========================================
// NOVOS COMPONENTES: MODAL COM RODAPÉ FIXO
// ==========================================
export const PropertyModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 85vh; 
  overflow: hidden; 
  font-family: 'Inter', sans-serif;
`;

export const PropertyModalContent = styled.div`
  flex: 1;
  overflow-y: auto; 
  padding: 0 24px 24px 24px;
`;

export const PropertyModalFooter = styled.div`
  flex-shrink: 0; 
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background-color: #ffffff;
  flex-wrap: wrap;
  gap: 16px;
`;

export const PropertyTabsHeader = styled.div`
  display: flex;
  gap: 24px;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 24px;
  margin-top: 16px;
`;

export const PropertyTabBtn = styled.button<{ $active?: boolean }>`
  padding: 0 0 12px 0;
  background: none;
  border: none;
  cursor: pointer;
  border-bottom: 2px solid ${props => props.$active ? '#3b82f6' : 'transparent'};
  color: ${props => props.$active ? '#3b82f6' : '#9ca3af'};
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: -1px;
  transition: all 0.2s;

  &:hover {
    color: #3b82f6;
  }
`;

export const ReadonlyFieldWrapper = styled.div<{ $fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  grid-column: ${props => props.$fullWidth ? '1 / -1' : 'auto'};
`;

export const ReadonlyFieldLabel = styled.span`
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
`;

export const ReadonlyFieldValue = styled.div`
  background-color: #f8fafc;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
  font-size: 0.95rem;
  color: #374151;
  font-weight: 600;
  min-height: 20px;
  display: flex;
  align-items: center;
`;

export const StatusSelect = styled.select`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background-color: #f8fafc;
  color: #111827;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  font-size: 0.9rem;
`;

export const BtnModalOutline = styled.button`
  padding: 10px 24px;
  background: #ffffff;
  color: #4b5563;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
  }
`;

export const BtnModalPrimary = styled.button`
  padding: 10px 32px;
  background: #3b82f6;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s;

  &:hover {
    background: #2563eb;
  }
`;