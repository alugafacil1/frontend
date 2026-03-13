"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast"; 
import type { PropertyResponse } from "@/types/property";
import { BaseModal, ModalBody } from "@/components/Modal/Modal";
import { useUser } from "@/services/queries/Users";
import { formatCPF } from "@/utils/masks";
import { useUpdatePropertyStatus } from "@/services/queries/Properties";
import type { StaticImageData } from "next/image";

import {
  PropertyTabsHeader,
  PropertyTabBtn,
  ReadonlyFieldWrapper,
  ReadonlyFieldLabel,
  ReadonlyFieldValue,
  StatusSelect,
  BtnModalOutline,
  BtnModalPrimary
} from "../styles";
import { translateRole } from "@/utils/translateRoles";

interface PropertyDetailsProps {
  property: PropertyResponse;
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

const ReadOnlyField = ({ label, value, fullWidth = false }: { label: string; value: React.ReactNode; fullWidth?: boolean }) => (
  <ReadonlyFieldWrapper $fullWidth={fullWidth}>
    <ReadonlyFieldLabel>{label}</ReadonlyFieldLabel>
    <ReadonlyFieldValue>{value}</ReadonlyFieldValue>
  </ReadonlyFieldWrapper>
);

export function PropertyDetailsModal({ property, isOpen, onClose, userRole }: PropertyDetailsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"details" | "location" | "owner">("details");
  const [currentStatus, setCurrentStatus] = useState(property.status);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { mutateAsync: updateStatus, isPending: isUpdating } = useUpdatePropertyStatus();

  const { data: owner, isLoading: isLoadingOwner } = useUser(
    property.ownerId,
    activeTab === "owner" && !!property.ownerId
  );

  useEffect(() => {
    setCurrentStatus(property.status);
  }, [property.status]);

  const isAgency = userRole === "AGENCY" || userRole === "AGENCY_ADMIN" || userRole?.includes("AGENCY");
  const isAdmin = userRole === "ADMIN";
  const isRealtor = userRole === "REALTOR";
  const formatCurrency = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const formatBoolean = (val: boolean) => (val ? "Sim" : "Não");

  const ownerTabLabel = isAgency ? "Agente Responsável" : "Proprietário";

  // Dicionário de tradução para os Status
  const statusLabels: Record<string, string> = {
    ACTIVE: "Ativo",
    PENDING: "Pendente",
    REJECTED: "Rejeitado",
    PAUSED: "Pausado",
    PLACED: "Alugado"
  };

  const propertyTypeLabels: Record<string, string> = {
    HOUSE: "Casa", APARTMENT: "Apartamento", COMMERCIAL: "Ponto Comercial", STUDIO: "Studio"
  };

  const isPending = property.status === "PENDING";
  const canChangeStatus = !(isRealtor && isPending);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "#10b981";
      case "PENDING": return "#f59e0b";
      case "REJECTED": return "#ef4444";
      case "PAUSED": return "#6b7280";
      case "PLACED": return "#3b82f6";
      default: return "#cbd5e1";
    }
  };

  const handleApprove = async () => {
    try {
      await updateStatus({ id: property.propertyId, status: "ACTIVE" });
      toast.success("Imóvel aprovado e publicado!", { position: "bottom-center" });
      onClose();
    } catch (e) {
      toast.error("Falha ao aprovar imóvel.");
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) return toast.error("Informe o motivo da reprovação.");
    try {
      await updateStatus({ id: property.propertyId, status: "REJECTED", reason: rejectReason });
      toast.success("Imóvel rejeitado com sucesso.");
      onClose();
    } catch (e) {
      toast.error("Erro ao processar reprovação.");
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    const oldStatus = currentStatus;

    if (newStatus === "REJECTED") {
      const promptReason = window.prompt("Informe o motivo da reprovação:");
      if (!promptReason) return;
      
      setCurrentStatus(newStatus);
      try {
        await updateStatus({ id: property.propertyId, status: newStatus, reason: promptReason });
        toast.success(`Status atualizado para: ${statusLabels[newStatus]}`);
      } catch (error) {
        setCurrentStatus(oldStatus);
        toast.error("Erro na atualização.");
      }
      return;
    }

    setCurrentStatus(newStatus);
    try {
      await updateStatus({ id: property.propertyId, status: newStatus });
      toast.success(`Status alterado para: ${statusLabels[newStatus]}`);
    } catch (error) {
      setCurrentStatus(oldStatus);
      toast.error("Erro ao salvar status.");
    }
  };

  const renderDetailsTab = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {property.photoUrls && property.photoUrls.length > 0 ? (
        <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }}>
          {property.photoUrls.map((url, index) => (
            <img
              key={index}
              src={typeof url === "string" ? url : (url as StaticImageData).src}
              alt={`Foto ${index + 1}`}
              style={{ width: "200px", height: "140px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }}
            />
          ))}
        </div>
      ) : (
        <div style={{ height: "120px", width: "100%", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
          Nenhuma imagem disponível
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <ReadOnlyField label="Valor" value={formatCurrency(property.priceInCents)} />
        <ReadOnlyField label="Tipo" value={propertyTypeLabels[property.type] || property.type} />
        <ReadOnlyField label="Quartos" value={property.numberOfBedrooms} />
        <ReadOnlyField label="Banheiros" value={property.numberOfBathrooms} />
      </div>

      <ReadOnlyField label="Descrição" value={property.description || "Sem descrição."} fullWidth />
    </div>
  );

  const renderLocationTab = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
      {/* Linha 1: Rua e Número */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
        <ReadOnlyField label="Rua / Av" value={property.address?.street || "Não informado"} />
        <ReadOnlyField label="Número" value={property.address?.number || "S/N"} />
      </div>

      {/* Linha 2: Cidade, Estado e País */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
        <ReadOnlyField label="Cidade" value={property.address?.city || "Não informada"} />
        {/* Ajustado de address.state para mostrar o estado correto, não o país */}
        <ReadOnlyField label="Estado" value={property.address?.state || "PE"} /> 
        <ReadOnlyField label="País" value="Brasil" />
      </div>

      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        
        <ReadOnlyField label="CEP" value={property.address?.postalCode || "00000-000"} />

      </div>


      
    </div>
  );

  const renderOwnerTab = () => {
    if (isLoadingOwner) return <div style={{ padding: "3rem", textAlign: "center", color: "#9ca3af" }}>Carregando perfil...</div>;
    if ( !owner) return <div style={{ padding: "3rem", textAlign: "center", color: "#ef4444" }}>Dados do proprietário indisponíveis.</div>;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Header do Perfil com Foto */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {owner.photoUrl ? (
            <img 
              src={owner.photoUrl} 
              alt={owner.name} 
              style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: "2px solid #3b82f6" }} 
            />
          ) : (
            <div style={{ 
              width: "64px", 
              height: "64px", 
              borderRadius: "50%", 
              backgroundColor: "#3b82f6", 
              color: "#fff", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              fontSize: "1.5rem", 
              fontWeight: "bold" 
            }}>
              {owner.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "#111827", display: "block" }}>{owner.name}</span>
            <span style={{ fontSize: "0.85rem", color: "#3b82f6", fontWeight: 600 }}>{translateRole(owner.userType)}</span>
          </div>
        </div>

        {/* Informações de Contato */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
          <ReadOnlyField label="E-mail" value={owner.email} fullWidth />
          
         
          <ReadOnlyField 
            label="Telefone de Contato" 
            value={owner.phoneNumber || "Telefone não cadastrado"} 
          />
        </div>

      </div>
    );
  };

  const isModerating = (isAgency || isAdmin) && isPending;

  const footerContent = isModerating ? (
    <div style={{ display: "flex", justifyContent: "center", width: "100%", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
      {isRejecting ? (
         <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input 
              type="text" 
              placeholder="Motivo..." 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}
            />
            <BtnModalPrimary onClick={handleRejectSubmit} disabled={isUpdating}>Confirmar</BtnModalPrimary>
            <BtnModalOutline onClick={() => setIsRejecting(false)}>Voltar</BtnModalOutline>
         </div>
      ) : (
         <div style={{ display: "flex", gap: "16px" }}>
            <BtnModalOutline onClick={() => setIsRejecting(true)} style={{ color: "#ef4444", borderColor: "#ef4444" }}>Reprovar</BtnModalOutline>
            <BtnModalPrimary onClick={handleApprove} disabled={isUpdating}>
              {isUpdating ? "Processando..." : "Aprovar Imóvel"}
            </BtnModalPrimary>
         </div>
      )}
    </div>
  ) : (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Status:</span>
        <div style={{ position: "relative" }}>
          <StatusSelect 
            value={currentStatus} 
            onChange={handleStatusChange} 
            disabled={isUpdating || !canChangeStatus}
            style={{ paddingLeft: "28px", borderColor: getStatusColor(currentStatus) }}
          >
            <option value="ACTIVE">{statusLabels.ACTIVE}</option>
            {isPending && <option value="PENDING">{statusLabels.PENDING}</option>}
            <option value="PAUSED">{statusLabels.PAUSED}</option>
            <option value="PLACED">{statusLabels.PLACED}</option>
          </StatusSelect>
          <div style={{ 
            position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)",
            width: "10px", height: "10px", borderRadius: "50%", background: getStatusColor(currentStatus),
            boxShadow: `0 0 8px ${getStatusColor(currentStatus)}88`
          }} />
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        <BtnModalOutline onClick={onClose}>Fechar</BtnModalOutline>
        <BtnModalPrimary onClick={() => { onClose(); router.push(`/ads/edit/${property.propertyId}`); }}>
          Editar
        </BtnModalPrimary>
      </div>
    </div>
  );

  return (
    <>
      <Toaster />
      <BaseModal 
        isOpen={isOpen} 
        onRequestClose={onClose} 
        title={isModerating ? `Moderando: ${property.title}` : property.title}
        footer={footerContent}
      >
        <ModalBody>
          <PropertyTabsHeader style={{ marginTop: 0 }}>
            <PropertyTabBtn $active={activeTab === "details"} onClick={() => setActiveTab("details")}>Detalhes</PropertyTabBtn>
            <PropertyTabBtn $active={activeTab === "location"} onClick={() => setActiveTab("location")}>Localização</PropertyTabBtn>
            <PropertyTabBtn $active={activeTab === "owner"} onClick={() => setActiveTab("owner")}>{ownerTabLabel}</PropertyTabBtn>
          </PropertyTabsHeader>

          <div style={{ marginTop: "0px" }}>
            {activeTab === "details" && renderDetailsTab()}
            {activeTab === "location" && renderLocationTab()}
            {activeTab === "owner" && renderOwnerTab()}
          </div>
        </ModalBody>
      </BaseModal>
    </>
  );
}