"use client";

import { useState } from 'react';
import * as S from '../styles';
import type { RealtorResponse } from "@/types/realtor";
import { BaseModal, ModalBody } from '@/components/Modal/Modal';
import { formatCPF } from '@/utils/masks';
import { useUpdateUserStatus } from '@/services/queries/Users';
import { useAgencyMembers, useTransferAllProperties } from '@/services/queries/Realtors';
import { toast } from 'react-toastify'
import { useAuth } from '@/lib/auth/useAuth';

interface RealtorDetailsModalProps {
    realtor: RealtorResponse;
    isOpen: boolean;
    onClose: () => void;
}

export function RealtorDetailsModal({ realtor, isOpen, onClose }: RealtorDetailsModalProps) {
    const roleLabels: Record<string, string> = {
        ADMIN: "Administrador do Sistema",
        AGENCY_ADMIN: "Administrador da Agência",
        REALTOR: "Corretor",
    };

    const { user } = useAuth();
    const agencyId = user?.agencyId;

    const { mutateAsync: updateStatus, isPending: isUpdatingStatus } = useUpdateUserStatus();
    const { data: agencyMembers } = useAgencyMembers(agencyId, 0, 100);
    const { mutateAsync: transferProperties, isPending: isTransferring } = useTransferAllProperties();

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedTargetRealtor, setSelectedTargetRealtor] = useState("");
    
    const currentRealtorId = realtor.userId;
    
    const isBlocked = realtor.status === 'BLOCKED';
    const actionText = isBlocked ? 'desbloquear' : 'bloquear';

    const hasProperties = (realtor.propertiesCount || 0) > 0;
    const canBlock = isBlocked || !hasProperties; 

    const availableRealtorsToTransfer = agencyMembers?.content.filter(
        (r) => r.userId !== currentRealtorId && r.status === 'ACTIVE'
    ) || [];

    const handleActionClick = () => {
        setIsConfirmOpen(true);
    };

    const handleConfirmAction = async () => {
        try {
            await updateStatus({ 
                id: currentRealtorId, 
                status: isBlocked ? 'ACTIVE' : 'BLOCKED' 
            });
            
            setIsConfirmOpen(false);
            onClose(); 
            toast.success(`Corretor ${isBlocked ? 'desbloqueado' : 'bloqueado'} com sucesso!`);
        } catch (error) {
            toast.error(`Erro ao ${actionText} o corretor. Tente novamente.`);
            console.error(error);
            setIsConfirmOpen(false);
        }
    };

    const handleTransferProperties = async () => {
        if (!selectedTargetRealtor || !agencyId || !user?.id) {
            toast.warning("Dados insuficientes para realizar a transferência.");
            return;
        }
        
        try {
            await transferProperties({
                agencyId: agencyId,
                fromRealtorId: currentRealtorId,
                toRealtorId: selectedTargetRealtor, // Agora vai enviar o UUID certinho!
                actingUserId: user.id
            });
            
            toast.success("Imóveis transferidos com sucesso!");
            onClose(); 
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Erro ao transferir os imóveis. Verifique a conexão.";
            toast.error(errorMessage);
            console.error(error);
        }
    };

    const footerButtons = (
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <button 
                onClick={handleActionClick}
                disabled={isUpdatingStatus || realtor.userType === 'ADMIN' || !canBlock}
                style={{ 
                    padding: '8px 16px', 
                    background: 'none', 
                    color: !canBlock || realtor.userType === 'ADMIN' ? '#9ca3af' : (isBlocked ? '#16a34a' : '#dc2626'), 
                    border: `1px solid ${!canBlock || realtor.userType === 'ADMIN' ? '#d1d5db' : (isBlocked ? '#16a34a' : '#dc2626')}`, 
                    borderRadius: '6px', 
                    fontWeight: 600, 
                    cursor: !canBlock || realtor.userType === 'ADMIN' ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                {isBlocked ? 'Desbloquear Corretor' : 'Bloquear Corretor'}
            </button>
            
            <button 
                onClick={onClose} 
                disabled={isUpdatingStatus || isTransferring} 
                style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', color: '#374151' }}
            >
                Fechar
            </button>
        </div>
    );

    const confirmFooterButtons = (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', width: '100%' }}>
            <button 
                onClick={() => setIsConfirmOpen(false)} 
                disabled={isUpdatingStatus}
                style={{ padding: '8px 16px', background: 'none', border: '1px solid #d1d5db', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', color: '#374151' }}
            >
                Cancelar
            </button>
            <button 
                onClick={handleConfirmAction} 
                disabled={isUpdatingStatus}
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
                {isUpdatingStatus ? 'Processando...' : `Sim, ${actionText}`}
            </button>
        </div>
    );

    return (
        <>
            <BaseModal
                isOpen={isOpen} 
                onRequestClose={onClose} 
                title="Detalhes do Corretor"
                footer={footerButtons}
            >
                <ModalBody>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                        {realtor.photoUrl ? (
                            <img 
                                src={realtor.photoUrl} 
                                alt={realtor.name} 
                                style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb' }}
                            />
                        ) : (
                            <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#d1fae5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 'bold' }}>
                                {realtor.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>{realtor.name}</h3>
                                {isBlocked && (
                                    <span style={{ fontSize: '0.7rem', color: '#dc2626', background: '#fee2e2', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                                        Bloqueado
                                    </span>
                                )}
                            </div>
                            <span style={{ fontSize: '0.85rem', color: '#065f46', background: '#d1fae5', padding: '4px 10px', borderRadius: '12px', marginTop: '6px', display: 'inline-block', fontWeight: 600 }}>
                                {roleLabels[realtor.userType] || realtor.userType}
                            </span>
                        </div>
                    </div>

                    <S.FeatureGrid>
                        <S.FeatureItem>
                            <span className="label">E-mail</span>
                            <span className="value" style={{ wordBreak: 'break-all' }}>{realtor.email}</span>
                        </S.FeatureItem>
                        <S.FeatureItem>
                            <span className="label">Telefone</span>
                            <span className="value">{realtor.phoneNumber || "Não informado"}</span>
                        </S.FeatureItem>
                        <S.FeatureItem>
                            <span className="label">CRECI</span>
                            <span className="value" style={{ fontWeight: 600 }}>{realtor.creciNumber || "Não informado"}</span>
                        </S.FeatureItem>
                        <S.FeatureItem>
                            <span className="label">CPF</span>
                            <span className="value">{realtor.cpf ? formatCPF(realtor.cpf) : "Não informado"}</span>
                        </S.FeatureItem>
                    </S.FeatureGrid>

                    {hasProperties && !isBlocked && (
                        <div style={{ marginTop: '1.5rem', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '1rem' }}>
                                Transferência de Carteira
                            </h4>
                            <p style={{ margin: '0 0 15px 0', color: '#64748b', fontSize: '0.875rem' }}>
                                Este corretor gerencia <strong>{realtor.propertiesCount} imóveis</strong>. Para bloqueá-lo, você deve primeiro transferir seus imóveis para outro corretor ativo.
                            </p>
                            
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                                        Selecione o corretor destino
                                    </label>
                                    <select 
                                        value={selectedTargetRealtor}
                                        onChange={(e) => setSelectedTargetRealtor(e.target.value)}
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                                        disabled={isTransferring}
                                    >
                                        <option value="">Selecione...</option>
                                        {availableRealtorsToTransfer.map(r => (
                                            <option key={r.userId} value={r.userId}>
                                                {r.name} (CRECI: {r.creciNumber || 'N/A'})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button 
                                    onClick={handleTransferProperties}
                                    disabled={!selectedTargetRealtor || isTransferring}
                                    style={{ 
                                        padding: '9px 16px', 
                                        backgroundColor: !selectedTargetRealtor ? '#cbd5e1' : '#2563eb', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '6px', 
                                        fontWeight: 600, 
                                        cursor: !selectedTargetRealtor ? 'not-allowed' : 'pointer',
                                        height: 'fit-content',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {isTransferring ? 'Transferindo...' : 'Transferir Imóveis'}
                                </button>
                            </div>
                        </div>
                    )}

                    <S.DescriptionBox style={{ marginTop: '1.5rem' }}>
                        <div style={{ padding: '1rem', backgroundColor: isBlocked ? '#f0fdf4' : '#f8fafc', border: `1px dashed ${isBlocked ? '#bbf7d0' : '#cbd5e1'}`, borderRadius: '8px', color: isBlocked ? '#166534' : '#475569', fontSize: '0.9rem' }}>
                            {!canBlock && !isBlocked ? (
                                <span style={{ color: '#b45309', fontWeight: 600 }}>
                                    ⚠️ O bloqueio está desabilitado pois o corretor ainda possui imóveis sob sua responsabilidade.
                                </span>
                            ) : isBlocked ? (
                                <><strong>Ação de Desbloqueio:</strong> Ao desbloquear este corretor, ele recuperará o acesso ao painel da imobiliária.</>
                            ) : (
                                <><strong>Ações de Moderação:</strong> Ao bloquear este corretor, ele perderá o acesso ao sistema. Apenas corretores com a carteira de imóveis vazia podem ser bloqueados.</>
                            )}
                        </div>
                    </S.DescriptionBox>
                </ModalBody>
            </BaseModal>

            {isConfirmOpen && (
                <BaseModal
                    isOpen={isConfirmOpen}
                    onRequestClose={() => setIsConfirmOpen(false)}
                    title={`Atenção: ${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Corretor`}
                    footer={confirmFooterButtons}
                >
                    <ModalBody>
                        <div style={{ padding: '1rem 0', color: '#374151', fontSize: '1rem', lineHeight: '1.5' }}>
                            Tem certeza que deseja <strong>{actionText}</strong> o corretor <strong>{realtor.name}</strong>?
                            <br /><br />
                            {!isBlocked && (
                                <span style={{ color: '#dc2626', fontSize: '0.9rem' }}>
                                    ⚠️ Ele será desconectado do sistema e não poderá mais cadastrar ou editar imóveis em nome da agência.
                                </span>
                            )}
                            {isBlocked && (
                                <span style={{ color: '#16a34a', fontSize: '0.9rem' }}>
                                    ✅ O acesso dele ao painel de corretores será restabelecido imediatamente.
                                </span>
                            )}
                        </div>
                    </ModalBody>
                </BaseModal>
            )}
        </>
    );
}