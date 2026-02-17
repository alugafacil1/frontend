"use client";

import { useState } from 'react';
import * as S from '../styles';
import type { UserResponse } from "@/types/user";
import { BaseModal, ModalBody } from '@/components/Modal/Modal';
import { formatCPF } from '@/utils/masks';
import { useUpdateUserStatus } from '@/services/queries/Users';

interface UserDetailsModalProps {
    user: UserResponse;
    isOpen: boolean;
    onClose: () => void;
}

export function UserDetailsModal({ user, isOpen, onClose }: UserDetailsModalProps) {
    const roleLabels: Record<string, string> = {
        ADMIN: "Administrador",
        REALTOR: "Corretor",
        OWNER: "Proprietário",
        TENANT: "Locatário"
    };

    const { mutateAsync: updateStatus, isPending } = useUpdateUserStatus();
    
    // Novo estado para controlar o Modal de Confirmação
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    
    const isBlocked = user.status === 'BLOCKED';
    const actionText = isBlocked ? 'desbloquear' : 'bloquear';

    // Ao invés de usar o alert() do navegador, apenas abrimos o nosso Modal de Confirmação
    const handleActionClick = () => {
        setIsConfirmOpen(true);
    };

    // Esta é a função que realmente dispara a requisição quando o Admin clica em "Sim"
    const handleConfirmAction = async () => {
        try {
            await updateStatus({ 
                id: user.userId, 
                status: isBlocked ? 'ACTIVE' : 'BLOCKED' 
            });
            
            // Fecha ambos os modais após o sucesso
            setIsConfirmOpen(false);
            onClose(); 
        } catch (error) {
            alert(`Erro ao ${actionText} o usuário. Tente novamente.`);
            console.error(error);
            setIsConfirmOpen(false);
        }
    };

    // --- BOTÕES DO MODAL PRINCIPAL ---
    const footerButtons = (
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <button 
                onClick={handleActionClick} // Chama a abertura da confirmação
                disabled={isPending || user.userType === 'ADMIN'}
                style={{ 
                    padding: '8px 16px', 
                    background: 'none', 
                    color: user.userType === 'ADMIN' ? '#9ca3af' : (isBlocked ? '#16a34a' : '#dc2626'), 
                    border: `1px solid ${user.userType === 'ADMIN' ? '#d1d5db' : (isBlocked ? '#16a34a' : '#dc2626')}`, 
                    borderRadius: '6px', 
                    fontWeight: 600, 
                    cursor: user.userType === 'ADMIN' ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                {isBlocked ? 'Desbloquear Usuário' : 'Bloquear Usuário'}
            </button>
            
            <button 
                onClick={onClose} 
                disabled={isPending} 
                style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', color: '#374151' }}
            >
                Fechar
            </button>
        </div>
    );

    // --- BOTÕES DO MODAL DE CONFIRMAÇÃO ---
    const confirmFooterButtons = (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', width: '100%' }}>
            <button 
                onClick={() => setIsConfirmOpen(false)} 
                disabled={isPending}
                style={{ padding: '8px 16px', background: 'none', border: '1px solid #d1d5db', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', color: '#374151' }}
            >
                Cancelar
            </button>
            <button 
                onClick={handleConfirmAction} 
                disabled={isPending}
                style={{ 
                    padding: '8px 16px', 
                    background: isBlocked ? '#16a34a' : '#dc2626', 
                    border: 'none', 
                    borderRadius: '6px', 
                    fontWeight: 600, 
                    cursor: 'pointer', 
                    color: 'white' 
                }}
            >
                {isPending ? 'Processando...' : `Sim, ${actionText}`}
            </button>
        </div>
    );

    return (
        <>
            {/* Modal Principal (Detalhes do Usuário) */}
            <BaseModal
                isOpen={isOpen} 
                onRequestClose={onClose} 
                title="Gerenciar Usuário"
                footer={footerButtons}
            >
                <ModalBody>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                        {user.photoUrl ? (
                            <img 
                                src={user.photoUrl} 
                                alt={user.name} 
                                style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb' }}
                            />
                        ) : (
                            <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 'bold' }}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>{user.name}</h3>
                                {isBlocked && (
                                    <span style={{ fontSize: '0.7rem', color: '#dc2626', background: '#fee2e2', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                                        Bloqueado
                                    </span>
                                )}
                            </div>
                            <span style={{ fontSize: '0.85rem', color: '#4b5563', background: '#f3f4f6', padding: '4px 10px', borderRadius: '12px', marginTop: '6px', display: 'inline-block', fontWeight: 500 }}>
                                {roleLabels[user.userType] || user.userType}
                            </span>
                        </div>
                    </div>

                    <S.FeatureGrid>
                        <S.FeatureItem>
                            <span className="label">E-mail</span>
                            <span className="value" style={{ wordBreak: 'break-all' }}>{user.email}</span>
                        </S.FeatureItem>
                        <S.FeatureItem>
                            <span className="label">Telefone</span>
                            <span className="value">{user.phoneNumber || "Não informado"}</span>
                        </S.FeatureItem>
                        <S.FeatureItem>
                            <span className="label">CPF</span>
                            <span className="value">{formatCPF(user.cpf)}</span>
                        </S.FeatureItem>
                        <S.FeatureItem>
                            <span className="label">ID no Sistema</span>
                            <span className="value" style={{ fontSize: '0.85rem', color: '#6b7280' }}>{user.userId}</span>
                        </S.FeatureItem>
                    </S.FeatureGrid>

                    <S.DescriptionBox>
                        <div style={{ padding: '1rem', backgroundColor: isBlocked ? '#f0fdf4' : '#f8fafc', border: `1px dashed ${isBlocked ? '#bbf7d0' : '#cbd5e1'}`, borderRadius: '8px', color: isBlocked ? '#166534' : '#475569', fontSize: '0.9rem' }}>
                            {isBlocked ? (
                                <><strong>Ação de Desbloqueio:</strong> Ao desbloquear este usuário, ele poderá fazer login novamente. Seus imóveis pausados precisarão ser reativados manualmente.</>
                            ) : (
                                <><strong>Ações de Moderação:</strong> Ao bloquear este usuário, todos os seus imóveis ativos serão pausados automaticamente e ele perderá o acesso ao aplicativo.</>
                            )}
                        </div>
                    </S.DescriptionBox>
                </ModalBody>
            </BaseModal>

            {/* Sub-Modal de Confirmação */}
            {isConfirmOpen && (
                <BaseModal
                    isOpen={isConfirmOpen}
                    onRequestClose={() => setIsConfirmOpen(false)}
                    title={`Atenção: ${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Usuário`}
                    footer={confirmFooterButtons}
                >
                    <ModalBody>
                        <div style={{ padding: '1rem 0', color: '#374151', fontSize: '1rem', lineHeight: '1.5' }}>
                            Tem certeza que deseja <strong>{actionText}</strong> o usuário <strong>{user.name}</strong>?
                            <br /><br />
                            {!isBlocked && (
                                <span style={{ color: '#dc2626', fontSize: '0.9rem' }}>
                                    ⚠️ Ele não poderá mais acessar o sistema e todos os seus imóveis ativos serão pausados.
                                </span>
                            )}
                            {isBlocked && (
                                <span style={{ color: '#16a34a', fontSize: '0.9rem' }}>
                                    ✅ Ele recuperará o acesso ao sistema imediatamente.
                                </span>
                            )}
                        </div>
                    </ModalBody>
                </BaseModal>
            )}
        </>
    );
}