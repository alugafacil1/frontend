"use client";

import { useState } from 'react';
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
    // Opcional: Adicione uma função onEdit se for implementar a edição agora
    onEdit?: (id: string) => void; 
}

export function PropertyDetailsModal({ property, isOpen, onClose, onApprove, onReject, isAdmin, onEdit }: PropertyDetailsProps) {
    const [activeTab, setActiveTab] = useState<'details' | 'location' | 'owner'>('details');
    const [isPending, setIsPending] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    const { data: owner, isLoading: isLoadingOwner, isError: isErrorOwner } = useUser(
        property.ownerId, 
        activeTab === 'owner'
    );

    const formatCurrency = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatBoolean = (val: boolean) => val ? "Sim" : "Não";

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
        if (!rejectReason.trim()) {
            alert("Informe o motivo da reprovação.");
            return;
        }
        setIsPending(true);
        await onReject(property.propertyId, rejectReason);
        setIsPending(false);
    };

    // Componente auxiliar para renderizar os campos no estilo "input read-only" do mockup
    const ReadOnlyField = ({ label, value, fullWidth = false }: { label: string, value: React.ReactNode, fullWidth?: boolean }) => (
        <div className={`flex flex-col ${fullWidth ? 'col-span-full' : ''}`}>
            <span className="text-xs font-medium text-[#64748b] mb-1.5">{label}</span>
            <div className="bg-[#f8fafc] text-[#334155] p-3 rounded-[10px] text-sm min-h-[44px] flex items-center">
                {value}
            </div>
        </div>
    );

    const renderDetailsTab = () => (
        <div className="flex flex-col gap-6 animate-fadeIn">
            {/* Galeria de Imagens */}
            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                {property.photoUrls && property.photoUrls.length > 0 ? (
                    property.photoUrls.map((url, idx) => (
                        <img 
                            key={idx} 
                            src={url} 
                            alt={`Foto ${idx + 1}`} 
                            className="h-[140px] w-[220px] rounded-[10px] object-cover flex-shrink-0 border border-gray-100 shadow-sm"
                        />
                    ))
                ) : (
                    <div className="h-[140px] w-full bg-[#f8fafc] rounded-[10px] flex items-center justify-center text-[#9ca3af] border border-dashed border-gray-300">
                        Sem imagens no momento
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ReadOnlyField label="Valor" value={formatCurrency(property.priceInCents)} />
                <ReadOnlyField label="Tipo" value={propertyTypeLabels[property.type] || property.type} />
                <ReadOnlyField label="Quartos" value={property.numberOfBedrooms} />
                <ReadOnlyField label="Banheiros" value={property.numberOfBathrooms} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ReadOnlyField label="Garagem" value={formatBoolean(property.garage)} />
                <ReadOnlyField label="Mobiliado" value={formatBoolean(property.furnished)} />
                <ReadOnlyField label="Aceita Pets" value={formatBoolean(property.petFriendly)} />
            </div>

            {/* Linha 3: Descrição */}
            <ReadOnlyField 
                label="Descrição" 
                fullWidth 
                value={property.description || "Nenhuma descrição fornecida."} 
            />
        </div>
    );

    const renderLocationTab = () => (
        <div className="animate-fadeIn">
            <ReadOnlyField 
                label="Endereço cadastrado" 
                fullWidth
                value={
                    <div className="flex flex-col">
                        <span className="font-medium">{property.address.street}, {property.address.number}</span>
                        <span className="text-gray-500 text-xs mt-1">{property.address.city} - {property.address.state}</span>
                    </div>
                } 
            />
        </div>
    );

    const renderOwnerTab = () => {
        if (isLoadingOwner) return <div className="text-center p-8 text-gray-500">Carregando perfil...</div>;
        if (isErrorOwner || !owner) return <div className="text-center p-8 text-red-500">Erro ao buscar dados.</div>;

        return (
            <div className="flex flex-col gap-6 animate-fadeIn">
                <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                    {owner.photoUrl ? (
                        <img src={owner.photoUrl} alt={owner.name} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
                            {owner.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 m-0">{owner.name}</h3>
                        <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full mt-1 inline-block">
                            {owner.userType}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReadOnlyField label="E-mail" value={owner.email} />
                    <ReadOnlyField label="Telefone" value={owner.phoneNumber || "Não informado"} />
                    <ReadOnlyField label="CPF" value={formatCPF(owner.cpf)} />
                    {owner.creciNumber && <ReadOnlyField label="Registro CRECI" value={owner.creciNumber} />}
                </div>

                {owner.agency && (
                    <div className="mt-2 p-4 bg-green-50 border border-green-200 rounded-[10px]">
                        <span className="text-[10px] text-green-800 uppercase font-bold tracking-wider">Vinculado à Imobiliária</span>
                        <p className="mt-1 font-medium text-green-900">Agência: {owner.agency.name}</p>
                    </div>
                )}
            </div>
        );
    };

    const renderFooter = () => {
        if (isAdmin && property.status === 'PENDING') {
            return (
                <div className="flex justify-between w-full items-center mt-2">
                    <div className="flex gap-2">
                        {isRejecting ? (
                            <>
                                <input 
                                    type="text" 
                                    placeholder="Motivo da reprovação..." 
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="px-3 h-[40px] rounded-[10px] border border-gray-300 w-[250px] outline-none text-sm focus:ring-2 focus:ring-red-500"
                                />
                                <button onClick={handleRejectSubmit} disabled={isPending} className="h-[40px] px-6 bg-red-600 text-white rounded-[10px] font-semibold hover:bg-red-700 transition flex items-center justify-center">Confirmar</button>
                                <button onClick={() => setIsRejecting(false)} className="h-[40px] px-6 border border-gray-300 rounded-[10px] text-gray-700 hover:bg-gray-50 transition flex items-center justify-center">Cancelar</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setIsRejecting(true)} disabled={isPending} className="h-[40px] px-6 border border-red-600 text-red-600 rounded-[10px] font-semibold hover:bg-red-50 transition flex items-center justify-center">Reprovar</button>
                                <button onClick={handleApprove} disabled={isPending} className="h-[40px] px-6 bg-green-600 text-white rounded-[10px] font-semibold hover:bg-green-700 transition flex items-center justify-center">
                                    {isPending ? 'Aprovando...' : 'Aprovar Imóvel'}
                                </button>
                            </>
                        )}
                    </div>
                    <button onClick={onClose} disabled={isPending} className="h-[40px] px-6 bg-gray-100 rounded-[10px] font-semibold text-gray-700 hover:bg-gray-200 transition flex items-center justify-center">Fechar</button>
                </div>
            );
        }

        return (
            <div className="flex justify-center items-center gap-4 w-full mt-4">
                <button 
                    onClick={onClose} 
                    className="w-[140px] h-[40px] rounded-[10px] border border-[#515DEF] text-[#515DEF] font-semibold bg-white hover:bg-blue-50 transition-colors flex items-center justify-center"
                >
                    Cancelar
                </button>
                <button 
                    onClick={() => onEdit && onEdit(property.propertyId)} 
                    className="w-[140px] h-[40px] rounded-[10px] bg-[#515DEF] text-white font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                    Editar
                </button>
            </div>
        );
    };

    return (
        <BaseModal
            isOpen={isOpen} 
            onRequestClose={onClose} 
            title={isAdmin && property.status === 'PENDING' ? `Moderação: ${property.title}` : property.title}
            footer={renderFooter()}
        >
            <ModalBody>
                <div className="flex gap-6 border-b border-gray-200 mb-6">
                    <button 
                        className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'details' ? 'text-[#515DEF]' : 'text-[#64748b] hover:text-[#334155]'}`}
                        onClick={() => setActiveTab('details')}
                    >
                        Detalhes
                        {activeTab === 'details' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#515DEF] rounded-t-md" />}
                    </button>
                    
                    <button 
                        className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'location' ? 'text-[#515DEF]' : 'text-[#64748b] hover:text-[#334155]'}`}
                        onClick={() => setActiveTab('location')}
                    >
                        Localização
                        {activeTab === 'location' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#515DEF] rounded-t-md" />}
                    </button>

                    {isAdmin && (
                        <button 
                            className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'owner' ? 'text-[#515DEF]' : 'text-[#64748b] hover:text-[#334155]'}`}
                            onClick={() => setActiveTab('owner')}
                        >
                            Proprietário
                            {activeTab === 'owner' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#515DEF] rounded-t-md" />}
                        </button>
                    )}
                </div>

                <div className="pb-4">
                    {activeTab === 'details' && renderDetailsTab()}
                    {activeTab === 'location' && renderLocationTab()}
                    {activeTab === 'owner' && isAdmin && renderOwnerTab()}
                </div>
            </ModalBody>
        </BaseModal>
    );
}