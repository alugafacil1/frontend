import styled from "styled-components";

export const PageContainer = styled.div`
    padding: calc(80px + 2rem) 1.5rem 2rem 1.5rem;
    max-width: 1280px;
    margin: 0 auto;
    min-height: calc(100vh - 80px);
`;

export const TitleSection = styled.section`
    margin-bottom: 2rem;
    
    h1 { 
        color: #111827; 
        font-size: 1.875rem; 
        font-weight: 700;
        letter-spacing: -0.025em;
    }
    
    p { 
        color: #6b7280; 
        margin-top: 0.5rem;
        font-size: 0.875rem;
    }
    
    strong { 
        color: #2563eb; 
        background: #eff6ff;
        padding: 2px 8px;
        border-radius: 6px;
        font-weight: 600;
    }
`;

export const TabsContainer = styled.div`
    display: flex;
    gap: 0.5rem;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 1.5rem;
`;

export const TabButton = styled.button<{ $active: boolean }>`
    padding: 0.75rem 1.25rem;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    color: ${props => props.$active ? "#2563eb" : "#6b7280"};
    border-bottom: 2px solid ${props => props.$active ? "#2563eb" : "transparent"};
    transition: all 0.2s;
    position: relative;
    top: 1px;

    &:hover {
        color: #2563eb;
        background: #f9fafb;
    }
`;

export const ContentSection = styled.section`
    background: #fff;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    overflow: hidden;
`;

export const StatusBadge = styled.span<{ $status?: string }>`
    padding: 4px 10px;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    
    background: ${props => {
        switch(props.$status?.toUpperCase()) {
            case 'AVAILABLE': return '#dcfce7';
            case 'RENTED': return '#fef9c3';
            default: return '#f3f4f6';
        }
    }};
    
    color: ${props => {
        switch(props.$status?.toUpperCase()) {
            case 'AVAILABLE': return '#166534';
            case 'RENTED': return '#854d0e';
            default: return '#374151';
        }
    }};
`;