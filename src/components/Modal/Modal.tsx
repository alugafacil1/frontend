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
    overflow-y: auto;
    z-index: 1001;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

    &::-webkit-scrollbar { width: 8px; }
    &::-webkit-scrollbar-track { background-color: #f3f4f6; border-radius: 8px; }
    &::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 8px; }

    &:focus { outline: none; } /* Remove borda azul padrão do react-modal */
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #e5e7eb;

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
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

export const ModalFooter = styled.div`
    padding: 1.5rem 2rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    background-color: #f9fafb;
    border-bottom-left-radius: 1rem;
    border-bottom-right-radius: 1rem;
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
            <ModalHeader>
                <h2>{title}</h2>
                <CloseBtn onClick={onRequestClose}>
                    <RiCloseLine size={28} />
                </CloseBtn>
            </ModalHeader>

            <ModalBody>
                {children}
            </ModalBody>

            {footer && <ModalFooter>{footer}</ModalFooter>}
        </StyledReactModal>
    );
}