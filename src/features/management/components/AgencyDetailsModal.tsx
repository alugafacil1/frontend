"use client";

import { useState } from 'react';
import * as S from '../styles';
import type { AgencyResponse } from "@/types/agency";
import { BaseModal, ModalBody } from '@/components/Modal/Modal';

interface AgencyDetailsModalProps {
    agency: AgencyResponse;
    isOpen: boolean;
    onClose: () => void;
}

export function AgencyDetailsModal({ agency, isOpen, onClose }: AgencyDetailsModalProps) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    
    const [isPending, setIsPending] = useState(false);
    
    const isBlocked = agency.status === 'BLOCKED';
    const actionText = isBlocked ? 'desbloquear' : 'bloquear';

    // Máscara do CNPJ
    const formatCNPJ = (cnpj: string) => {
        if (!cnpj) return "Não informado";
        return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    };

    const roleLabels: Record<string, string> = {
        ADMIN: "Admin",
        REALTOR: "Corretor",
        OWNER: "Proprietário",
        TENANT: "Locatário"
    };

    const handleActionClick = () => {
        setIsConfirmOpen(true);
    };

    const handleConfirmAction = async () => {
        setIsPending(true);
        try {
            // Aqui chamaremos a mutação real no futuro: await updateAgencyStatus({ id: agency.agencyId, status: isBlocked ? 'ACTIVE' : 'BLOCKED' })
            console.log(`Simulando ${actionText} da agência...`);
            
            setTimeout(() => {
                alert(`Imobiliária ${isBlocked ? 'desbloqueada' : 'bloqueada'} com sucesso! (Simulação)`);
                setIsPending(false);
                setIsConfirmOpen(false);
                onClose(); 
            }, 1000);
            
        } catch (error) {
            alert(`Erro ao ${actionText} a imobiliária. Tente novamente.`);
            setIsPending(false);
            setIsConfirmOpen(false);
        }
    };

    // --- BOTÕES DO MODAL PRINCIPAL ---
    const footerButtons = (
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <button 
                onClick={handleActionClick}
                disabled={isPending}
                style={{ 
                    padding: '8px 16px', 
                    background: 'none', 
                    color: isBlocked ? '#16a34a' : '#dc2626', 
                    border: `1px solid ${isBlocked ? '#16a34a' : '#dc2626'}`, 
                    borderRadius: '6px', 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                {isBlocked ? 'Desbloquear Imobiliária' : 'Bloquear Imobiliária'}
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
            {/* Modal Principal */}
            <BaseModal
                isOpen={isOpen} 
                onRequestClose={onClose} 
                title="Detalhes da Imobiliária"
                footer={footerButtons}
            >
                <ModalBody>
                    {/* CABEÇALHO */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                        {agency.photoUrl ? (
                            <img 
                                src={agency.photoUrl} 
                                alt={agency.name} 
                                style={{ width: '72px', height: '72px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #e5e7eb' }}
                            />
                        ) : (
                            <div style={{ width: '72px', height: '72px', borderRadius: '12px', backgroundColor: '#f3e8ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 'bold' }}>
                                {agency.name.substring(0, 2).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>{agency.name}</h3>
                                {isBlocked && (
                                    <span style={{ fontSize: '0.7rem', color: '#dc2626', background: '#fee2e2', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                                        Bloqueada
                                    </span>
                                )}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '4px' }}>
                                {agency.corporateName}
                            </div>
                        </div>
                    </div>

                    {/* INFORMAÇÕES GERAIS */}
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#374151' }}>Dados Cadastrais</h4>
                    <S.FeatureGrid style={{ marginBottom: '2rem' }}>
                        <S.FeatureItem>
                            <span className="label">CNPJ</span>
                            <span className="value" style={{ fontFamily: 'monospace' }}>{formatCNPJ(agency.cnpj)}</span>
                        </S.FeatureItem>
                        <S.FeatureItem>
                            <span className="label">E-mail Comercial</span>
                            <span className="value" style={{ wordBreak: 'break-all' }}>{agency.email}</span>
                        </S.FeatureItem>
                        <S.FeatureItem>
                            <span className="label">Telefone</span>
                            <span className="value">{agency.phoneNumber || "Não informado"}</span>
                        </S.FeatureItem>
                        <S.FeatureItem>
                            <span className="label">Website</span>
                            <span className="value">
                                {agency.website ? (
                                    <a href={agency.website.startsWith('http') ? agency.website : `https://${agency.website}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>
                                        {agency.website}
                                    </a>
                                ) : "Não informado"}
                            </span>
                        </S.FeatureItem>
                    </S.FeatureGrid>

                    {/* LISTA DE MEMBROS DA EQUIPE */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h4 style={{ margin: 0, fontSize: '1rem', color: '#374151' }}>Equipe Vinculada</h4>
                            <span style={{ fontSize: '0.8rem', background: '#e5e7eb', color: '#4b5563', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                                {agency.members?.length || 0} Membros
                            </span>
                        </div>
                        
                        {agency.members && agency.members.length > 0 ? (
                            <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                                {agency.members.map((member, index) => (
                                    <div key={member.userId} style={{ 
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                        padding: '12px 16px', 
                                        borderBottom: index !== agency.members.length - 1 ? '1px solid #e5e7eb' : 'none',
                                        backgroundColor: '#fff'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>{member.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{member.email}</div>
                                        </div>
                                        <span style={{ 
                                            fontSize: '0.75rem', 
                                            fontWeight: 600, 
                                            color: member.userType === 'ADMIN' ? '#1e40af' : '#065f46', 
                                            backgroundColor: member.userType === 'ADMIN' ? '#dbeafe' : '#d1fae5', 
                                            padding: '4px 8px', 
                                            borderRadius: '12px',
                                            textTransform: 'uppercase'
                                        }}>
                                            {roleLabels[member.userType] || member.userType}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280', background: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: '8px', fontSize: '0.9rem' }}>
                                Nenhuma equipe cadastrada nesta imobiliária ainda.
                            </div>
                        )}
                    </div>

                    {/* AVISO DE MODERAÇÃO */}
                    <S.DescriptionBox>
                        <div style={{ padding: '1rem', backgroundColor: isBlocked ? '#f0fdf4' : '#fef2f2', border: `1px dashed ${isBlocked ? '#bbf7d0' : '#fecaca'}`, borderRadius: '8px', color: isBlocked ? '#166534' : '#991b1b', fontSize: '0.9rem' }}>
                            {isBlocked ? (
                                <><strong>Desbloqueio:</strong> A imobiliária e seus corretores voltarão a ter acesso ao sistema imediatamente.</>
                            ) : (
                                <><strong>Atenção:</strong> Ao bloquear esta imobiliária, todos os corretores da equipe perderão o acesso e os imóveis serão pausados automaticamente.</>
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
                    title={`Atenção: ${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Imobiliária`}
                    footer={confirmFooterButtons}
                >
                    <ModalBody>
                        <div style={{ padding: '1rem 0', color: '#374151', fontSize: '1rem', lineHeight: '1.5' }}>
                            Tem certeza que deseja <strong>{actionText}</strong> a imobiliária <strong>{agency.name}</strong>?
                            <br /><br />
                            {!isBlocked && (
                                <span style={{ color: '#dc2626', fontSize: '0.9rem' }}>
                                    ⚠️ Nenhum corretor desta equipe poderá acessar o painel até que a agência seja desbloqueada.
                                </span>
                            )}
                        </div>
                    </ModalBody>
                </BaseModal>
            )}
        </>
    );
}