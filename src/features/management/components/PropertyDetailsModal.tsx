"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

  const { data: owner, isLoading: isLoadingOwner, isError: isErrorOwner } = useUser(
    property.ownerId,
    activeTab === "owner"
  );

  // =========================================================================
  // VALIDAÇÃO DE PERFIL (CORRIGIDO PARA ACEITAR AGENCY_ADMIN)
  // =========================================================================
  const isAgency = userRole === "AGENCY" || userRole === "AGENCY_ADMIN" || userRole?.includes("AGENCY");
  const isAdmin = userRole === "ADMIN";
  const isRealtor = userRole === "REALTOR";

  const formatCurrency = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const formatBoolean = (val: boolean) => (val ? "Sim" : "Não");

  // Nome da terceira aba muda dinamicamente com base na correção da Role
  const ownerTabLabel = isAgency ? "Agente Responsável" : "Proprietário";

  const propertyTypeLabels: Record<string, string> = {
    HOUSE: "Casa", APARTMENT: "Apartamento", STUDIO: "Studio", ROOM: "Quarto", KITNET: "Kitnet"
  };

  // Trava de segurança: Agente não pode aprovar um imóvel Pendente para Ativo!
  const isPending = property.status === "PENDING";
  const canChangeStatus = !(isRealtor && isPending);

  // Ações Diretas da Agência/Admin (Botões de Aprovar e Reprovar)
  const handleApprove = async () => {
    try {
      await updateStatus({ id: property.propertyId, status: "ACTIVE" });
      onClose();
    } catch (e) {
      alert("Erro ao aprovar imóvel.");
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) return alert("Informe o motivo da reprovação.");
    try {
      await updateStatus({ id: property.propertyId, status: "REJECTED", reason: rejectReason });
      onClose();
    } catch (e) {
      alert("Erro ao reprovar imóvel.");
    }
  };

  // Ação via Select (Para mudança normal de Ativo para Pausado, etc)
  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    let reason = "";

    if (newStatus === "REJECTED") {
      const promptReason = window.prompt("Informe o motivo da reprovação deste imóvel:");
      if (!promptReason) return;
      reason = promptReason;
    }

    setCurrentStatus(newStatus);
    
    try {
      await updateStatus({ id: property.propertyId, status: newStatus, reason });
    } catch (error) {
      alert("Erro ao atualizar o status.");
      setCurrentStatus(property.status); 
    }
  };

  const renderDetailsTab = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {property.photoUrls && property.photoUrls.length > 0 ? (
        <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }}>
          {property.photoUrls.slice(0, 3).map((url, index) => (
            <img
              key={index}
              src={typeof url === "string" ? url : (url as StaticImageData).src}
              alt={`Foto ${index + 1}`}
              style={{ width: "calc(33.33% - 8px)", height: "140px", objectFit: "cover", borderRadius: "8px" }}
            />
          ))}
        </div>
      ) : (
        <div style={{ height: "120px", width: "100%", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
          Sem imagens no momento
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <ReadOnlyField label="Valor" value={formatCurrency(property.priceInCents)} />
        <ReadOnlyField label="Tipo" value={propertyTypeLabels[property.type] || property.type} />
        <ReadOnlyField label="Quartos" value={property.numberOfBedrooms} />
        <ReadOnlyField label="Banheiros" value={property.numberOfBathrooms} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <ReadOnlyField label="Garagem" value={formatBoolean(property.garage)} />
        <ReadOnlyField label="Mobiliado" value={formatBoolean(property.furnished)} />
        <ReadOnlyField label="Aceita Pets" value={formatBoolean(property.petFriendly)} />
      </div>

      <ReadOnlyField label="Descrição" value={property.description || "Nenhuma descrição fornecida."} fullWidth />
    </div>
  );

  const renderLocationTab = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <ReadOnlyField
        label="Endereço cadastrado"
        fullWidth
        value={
          <span>
            {property.address?.street}, {property.address?.number}
            <br />
            <span style={{ color: "#6b7280", fontSize: "0.85em", fontWeight: 500 }}>
              {property.address?.city} - {property.address?.state}
            </span>
          </span>
        }
      />
    </div>
  );

  const renderOwnerTab = () => {
    if (isLoadingOwner) return <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>Carregando perfil...</div>;
    if (isErrorOwner || !owner) return <div style={{ textAlign: "center", padding: "3rem", color: "#ef4444" }}>Erro ao buscar dados.</div>;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {owner.photoUrl ? (
            <img src={owner.photoUrl} alt={owner.name} style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#f8fafc", color: "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", fontWeight: "bold" }}>
              {owner.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <span style={{ fontSize: "1.1rem", color: "#111827", fontWeight: 600, display: "block" }}>{owner.name}</span>
            <span style={{ fontSize: "0.8rem", color: "#3b82f6", fontWeight: 600 }}>{owner.userType}</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <ReadOnlyField label="E-mail" value={owner.email} fullWidth />
          <ReadOnlyField label="Telefone" value={owner.phoneNumber || "Não informado"} />
          <ReadOnlyField label="CPF" value={formatCPF(owner.cpf)} />
          {owner.creciNumber && <ReadOnlyField label="Registro CRECI" value={owner.creciNumber} fullWidth />}
        </div>
      </div>
    );
  };

  // ==========================================
  // LÓGICA DO RODAPÉ (Moderação vs Gerenciamento Padrão)
  // ==========================================
  const isModerating = (isAgency || isAdmin) && isPending;

  const footerContent = isModerating ? (
    // Visual de Moderação (Botões Centralizados de Aprovar / Reprovar como na Imagem)
    <div style={{ display: "flex", justifyContent: "center", width: "100%", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
      {isRejecting ? (
         <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input 
              type="text" 
              placeholder="Motivo da reprovação..." 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none", width: "200px" }}
            />
            <BtnModalPrimary onClick={handleRejectSubmit} disabled={isUpdating}>Confirmar</BtnModalPrimary>
            <BtnModalOutline onClick={() => setIsRejecting(false)}>Cancelar</BtnModalOutline>
         </div>
      ) : (
         <div style={{ display: "flex", gap: "16px" }}>
            <BtnModalOutline onClick={() => setIsRejecting(true)} style={{ color: "#3b82f6", borderColor: "#3b82f6" }}>
              Reprovar
            </BtnModalOutline>
            <BtnModalPrimary onClick={handleApprove} disabled={isUpdating}>
              {isUpdating ? "Aguarde..." : "Aprovar"}
            </BtnModalPrimary>
         </div>
      )}
    </div>
  ) : (
    // Visual de Gerenciamento Padrão (Select de Status e Editar)
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#4b5563" }}>Status:</span>
        <StatusSelect value={currentStatus} onChange={handleStatusChange} disabled={isUpdating || !canChangeStatus}>
          <option value="ACTIVE">Ativo (Aprovado)</option>
          {isPending && <option value="PENDING">Pendente</option>}
          <option value="PAUSED">Pausado</option>
          <option value="PLACED">Alugado</option>
          <option value="REJECTED" disabled>Rejeitado</option>
        </StatusSelect>
        {isUpdating && <span style={{ fontSize: "0.8rem", color: "#3b82f6" }}>Salvando...</span>}
        
        {/* Aviso caso o corretor tente alterar um status bloqueado */}
        {!canChangeStatus && (
          <span style={{ fontSize: "0.75rem", color: "#ea580c", maxWidth: "150px", lineHeight: 1.2 }}>
            Apenas a Agência pode alterar este status.
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        <BtnModalOutline onClick={onClose}>Fechar</BtnModalOutline>
        <BtnModalPrimary onClick={() => { onClose(); router.push(`/ads/edit/${property.propertyId}`); }}>
          Editar Imóvel
        </BtnModalPrimary>
      </div>
    </div>
  );

  return (
    <BaseModal 
      isOpen={isOpen} 
      onRequestClose={onClose} 
      title={isModerating ? `Moderação: ${property.title}` : ""} // Título apenas na moderação igual a imagem
      footer={footerContent}
    >
      <ModalBody>
        <PropertyTabsHeader style={{ marginTop: 0 }}>
          <PropertyTabBtn $active={activeTab === "details"} onClick={() => setActiveTab("details")}>Detalhes</PropertyTabBtn>
          <PropertyTabBtn $active={activeTab === "location"} onClick={() => setActiveTab("location")}>Localização</PropertyTabBtn>
          <PropertyTabBtn $active={activeTab === "owner"} onClick={() => setActiveTab("owner")}>
            {ownerTabLabel}
          </PropertyTabBtn>
        </PropertyTabsHeader>

        {activeTab === "details" && renderDetailsTab()}
        {activeTab === "location" && renderLocationTab()}
        {activeTab === "owner" && renderOwnerTab()}
      </ModalBody>
    </BaseModal>
  );
}