import React, { ReactNode } from 'react';
import ReactModal from 'react-modal';
import { RiCloseLine } from 'react-icons/ri';
import styled from 'styled-components';

const StyledReactModal = styled(ReactModal)`
    background-color: #ffffff;
    border-radius: 1rem;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    
    /* 1. ESCONDE A ROLAGEM GERAL DO MODAL */
    overflow: hidden; 
    
    z-index: 1001;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

    &:focus { outline: none; } /* Remove borda azul padrão do react-modal */
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #e5e7eb;
    
    /* 2. TRAVA O CABEÇALHO PARA NÃO ENCOLHER */
    flex-shrink: 0;
    background-color: #ffffff;

    h2 {
        margin: 0;
        font-size: 1.25rem;
        color: #111827;
        font-weight: 600;
    }
`;

const CloseBtn = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
    transition: color 0.2s;

    &:hover { color: #111827; }
`;

export const ModalBody = styled.div`
    padding: 1.5rem 2rem; /* Ajustado levemente para equilibrar o visual */
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    
    /* 3. A MÁGICA ACONTECE AQUI: A rolagem fica APENAS no corpo */
    flex: 1;
    overflow-y: auto;

    /* Movemos o estilo da barra de rolagem apenas para o corpo */
    &::-webkit-scrollbar { width: 8px; }
    &::-webkit-scrollbar-track { background-color: #f3f4f6; border-radius: 8px; }
    &::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 8px; }
`;

export const ModalFooter = styled.div`
    padding: 1.25rem 2rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    
    /* Fundo branco para combinar perfeitamente com a imagem de referência */
    background-color: #ffffff; 
    
    border-bottom-left-radius: 1rem;
    border-bottom-right-radius: 1rem;
    
    /* 4. TRAVA O RODAPÉ PARA NÃO ENCOLHER E FICAR FIXO */
    flex-shrink: 0;
`;

// --- COMPONENTE BASE ---

interface BaseModalProps {
    isOpen: boolean;
    onRequestClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
}

export function BaseModal({ isOpen, onRequestClose, title, children, footer }: BaseModalProps) {
    return (
        <StyledReactModal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            ariaHideApp={false} // Ajuste isso na raiz do seu app idealmente: ReactModal.setAppElement('#root');
            style={{
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    zIndex: 1000,
                },
            }}
        >
            {/* Cabeçalho Fixo (Renderiza apenas se tiver título para não ocupar espaço à toa) */}
            {title && (
                <ModalHeader>
                    <h2>{title}</h2>
                    <CloseBtn onClick={onRequestClose}>
                        <RiCloseLine size={28} />
                    </CloseBtn>
                </ModalHeader>
            )}

            {/* Se não tiver título, renderizamos apenas o X flutuando (útil para o seu modal de Imóveis) */}
            {!title && (
                <ModalHeader style={{ padding: '1rem', borderBottom: 'none', justifyContent: 'flex-end', position: 'absolute', right: 0, top: 0, zIndex: 10, background: 'transparent' }}>
                    <CloseBtn onClick={onRequestClose}>
                        <RiCloseLine size={28} />
                    </CloseBtn>
                </ModalHeader>
            )}

            {/* Corpo com Rolagem */}
            <ModalBody>
                {children}
            </ModalBody>

            {/* Rodapé Fixo */}
            {footer && <ModalFooter>{footer}</ModalFooter>}
        </StyledReactModal>
    );
}