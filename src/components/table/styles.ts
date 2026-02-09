import styled from 'styled-components';

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 1rem; /* Reduzido de 1.5 */
`;

export const TableWrapper = styled.div`
    max-height: 40rem; /* Reduzido um pouco a altura máxima */
    overflow: auto;
    width: 100%;
    border-radius: 8px;
    border: 1px solid #e5e7eb; /* Borda externa para definição */
    
    &::-webkit-scrollbar { width: 6px; height: 6px; }
    &::-webkit-scrollbar-thumb { 
        background: #d1d5db; 
        border-radius: 10px;
    }
`;

export const TableComp = styled.table`
    width: 100%;
    border-collapse: separate; /* Permite bordas arredondadas com header sticky */
    border-spacing: 0;
    background-color: #fff;
    font-size: 0.875rem; /* ~14px - Padrão para dashboards */
    text-align: left;
`;

export const TH = styled.th`
    background-color: #f9fafb; /* Cinza bem claro em vez de azul forte */
    color: #374151;            /* Texto mais escuro e sóbrio */
    padding: 0.75rem 1rem;    /* Padding reduzido */
    font-weight: 600;
    font-size: 0.75rem;        /* Fonte menor no header */
    text-transform: uppercase;
    letter-spacing: 0.05em;
    position: sticky;
    top: 0;
    z-index: 10;
    border-bottom: 1px solid #e5e7eb;
`;

export const TR = styled.tr`
    transition: background-color 0.1s;

    &:hover {
        background-color: #f3f4f6;
    }
`;

export const TD = styled.td`
    padding: 0.75rem 1rem;    /* Padding mais compacto */
    color: #4b5563;
    vertical-align: middle;
    border-bottom: 1px solid #f3f4f6; /* Linha divisória sutil */
`;

export const PaginationContainer = styled.div`
    display: flex;
    justify-content: space-between; /* Espalha o texto e os botões */
    align-items: center;
    padding: 0.5rem 0;
    color: #6b7280;
    font-size: 0.8125rem;
`;

export const PaginationButtonsContainer = styled.div`
    display: flex;
    gap: 0.25rem;
`;

export const PaginationButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.4rem;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
    background-color: #fff;
    cursor: pointer;
    color: #374151;
    transition: all 0.2s;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    &:enabled:hover {
        background-color: #f9fafb;
        border-color: #d1d5db;
    }
`;