"use client";

import{ useState } from 'react';
import * as S from '../styles'; 
import type { PropertyResponse } from "@/types/property";
import { BaseModal, ModalBody } from '@/components/Modal/Modal';
import { useUser } from '@/services/queries/Users';
import { formatCPF } from '@/utils/masks';

interface PropertyDetailsProps {
    property: PropertyResponse;
    isOpen: boolean;
    onClose: () => void;
    onApprove: (id: string) => void; 
    onReject: (id: string, reason: string) => void;
    isAdmin: boolean;
}

export function PropertyDetailsModal({ property, isOpen, onClose, onApprove, onReject, isAdmin }: PropertyDetailsProps) {
    const [activeTab, setActiveTab] = useState<'details' | 'location' | 'owner'>('details');
    const [isPending, setIsPending] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    const { data: owner, isLoading: isLoadingOwner, isError: isErrorOwner } = useUser(
        property.ownerId, 
        activeTab === 'owner'
    );

    // Utilitários de formatação
    const formatCurrency = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatBoolean = (val: boolean) => val ? "Sim" : "Não";
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR');

    const propertyTypeLabels: Record<string, string> = {
        HOUSE: 'Casa',
        APARTMENT: 'Apartamento',
        STUDIO: 'Studio'
    };

    const handleApprove = async () => {
        setIsPending(true);
        await onApprove(property.propertyId);
        setIsPending(false);
    };

    const handleRejectSubmit = async () => {
        if (!rejectReason.trim()) return alert("Informe o motivo da reprovação.");
        setIsPending(true);
        await onReject(property.propertyId, rejectReason);
        setIsPending(false);
    };

    // --- ABAS ---

    const renderDetailsTab = () => (
        <ModalBody>
            {/* Galeria de Fotos - Tratado como opcional com base na nova interface */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                {property.photoUrls && property.photoUrls.length > 0 ? (
                    property.photoUrls.map((url, idx) => (
                        <img key={idx} src={url} alt={`Foto ${idx + 1}`} style={{ height: '150px', borderRadius: '8px', objectFit: 'cover' }} />
                    ))
                ) : (
                    <div style={{ height: '120px', width: '100%', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                        Sem imagens no momento
                    </div>
                )}
            </div>

            <S.FeatureGrid>
                <S.FeatureItem><span className="label">Valor</span><span className="value">{formatCurrency(property.priceInCents)}</span></S.FeatureItem>
                <S.FeatureItem><span className="label">Tipo</span><span className="value">{propertyTypeLabels[property.type] || property.type}</span></S.FeatureItem>
                <S.FeatureItem><span className="label">Quartos</span><span className="value">{property.numberOfBedrooms}</span></S.FeatureItem>
                <S.FeatureItem><span className="label">Banheiros</span><span className="value">{property.numberOfBathrooms}</span></S.FeatureItem>
                <S.FeatureItem><span className="label">Cômodos</span><span className="value">{property.numberOfRooms}</span></S.FeatureItem>
            </S.FeatureGrid>

            <S.FeatureGrid>
                <S.FeatureItem><span className="label">Garagem</span><span className="value">{formatBoolean(property.garage)}</span></S.FeatureItem>
                <S.FeatureItem><span className="label">Mobiliado</span><span className="value">{formatBoolean(property.furnished)}</span></S.FeatureItem>
                <S.FeatureItem><span className="label">Aceita Pets</span><span className="value">{formatBoolean(property.petFriendly)}</span></S.FeatureItem>
            </S.FeatureGrid>

            <S.DescriptionBox>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Descrição</span>
                <p>{property.description || "Nenhuma descrição fornecida."}</p>
            </S.DescriptionBox>
        </ModalBody>
    );

    const renderLocationTab = () => (
        <ModalBody>
            <S.DescriptionBox>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Endereço Cadastrado</span>
                <div style={{ marginTop: '0.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <p style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>
                        {property.address.street}, {property.address.number}
                    </p>
                    <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>
                        {property.address.city} - {property.address.state}
                    </p>
                </div>
            </S.DescriptionBox>
        </ModalBody>
    );

const renderOwnerTab = () => {
        if (isLoadingOwner) {
            return (
                <ModalBody>
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                        Carregando perfil do proprietário...
                    </div>
                </ModalBody>
            );
        }

        if (isErrorOwner || !owner) {
            return (
                <ModalBody>
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#dc2626' }}>
                        Erro ao buscar dados. O ID registrado é: {property.ownerId}
                    </div>
                </ModalBody>
            );
        }

        return (
            <ModalBody>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                    {owner.photoUrl ? (
                        <img 
                            src={owner.photoUrl} 
                            alt={owner.name} 
                            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            {owner.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>{owner.name}</h3>
                        <span style={{ fontSize: '0.85rem', color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '12px', marginTop: '4px', display: 'inline-block' }}>
                            {owner.userType}
                        </span>
                    </div>
                </div>

                <S.FeatureGrid>
                    <S.FeatureItem>
                        <span className="label">E-mail</span>
                        <span className="value" style={{ wordBreak: 'break-all' }}>{owner.email}</span>
                    </S.FeatureItem>
                    
                    <S.FeatureItem>
                        <span className="label">Telefone</span>
                        <span className="value">{owner.phoneNumber || "Não informado"}</span>
                    </S.FeatureItem>

                    <S.FeatureItem>
                        <span className="label">CPF</span>
                        <span className="value">{formatCPF(owner.cpf)}</span>
                    </S.FeatureItem>

                    {owner.creciNumber && (
                        <S.FeatureItem>
                            <span className="label">Registro CRECI</span>
                            <span className="value">{owner.creciNumber}</span>
                        </S.FeatureItem>
                    )}
                </S.FeatureGrid>

                {owner.agency && (
                    <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#166534', textTransform: 'uppercase', fontWeight: 600 }}>Vinculado à Imobiliária</span>
                        <p style={{ margin: '4px 0 0', color: '#14532d', fontWeight: 500 }}>Agência ID: {owner.agency}</p>
                    </div>
                )}
            </ModalBody>
        );
    };

    // --- RODAPÉ ---

    const footerButtons = (
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
                {isRejecting ? (
                    <>
                        <input 
                            type="text" 
                            placeholder="Motivo da reprovação..." 
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', width: '250px', outline: 'none' }}
                        />
                        <button onClick={handleRejectSubmit} disabled={isPending} style={{ padding: '8px 16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                            Confirmar
                        </button>
                        <button onClick={() => setIsRejecting(false)} style={{ padding: '8px 16px', background: 'none', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>
                            Cancelar
                        </button>
                    </>
                ) : (
                    isAdmin && property.status === 'PENDING' && (
                        <>
                            <button onClick={() => setIsRejecting(true)} disabled={isPending} style={{ padding: '8px 16px', background: 'none', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                                Reprovar
                            </button>
                            <button onClick={handleApprove} disabled={isPending} style={{ padding: '8px 16px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                                {isPending ? 'Aprovando...' : 'Aprovar Imóvel'}
                            </button>
                        </>
                    )
                )}
            </div>
            
            <button onClick={onClose} disabled={isPending} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
                Fechar
            </button>
        </div>
    );

    return (
        <BaseModal
            isOpen={isOpen} 
            onRequestClose={onClose} 
            title={`Moderação: ${property.title}`}
            footer={footerButtons}
        >
            <S.TabsHeader>
                <S.TabButton $active={activeTab === 'details'} onClick={() => setActiveTab('details')}>Detalhes</S.TabButton>
                <S.TabButton $active={activeTab === 'location'} onClick={() => setActiveTab('location')}>Localização</S.TabButton>
                <S.TabButton $active={activeTab === 'owner'} onClick={() => setActiveTab('owner')}>Proprietário</S.TabButton>
            </S.TabsHeader>

            {activeTab === 'details' && renderDetailsTab()}
            {activeTab === 'location' && renderLocationTab()}
            {activeTab === 'owner' && renderOwnerTab()}
        </BaseModal>
    );
}