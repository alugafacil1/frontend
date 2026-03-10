"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table } from "@/components/table/Table";
import { propertyService } from "@/services/property/propertyService";
import type { ColumnDef } from "@tanstack/react-table";
import type { PropertyResponse } from "@/types/property";

import { PropertyDetailsModal } from "./PropertyDetailsModal";
import {
  PageContainer,
  FilterContainer,
  FilterLabel,
  FilterPill,
  ContentSection,
  PropertyCell,
  ActionButton,
  StatusBadge,
} from "../styles";

interface PropertyManagementProps {
  userId?: string;
  userRole?: string;
}

export function PropertyManagement({ userId, userRole }: PropertyManagementProps) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [selectedProperty, setSelectedProperty] = useState<PropertyResponse | null>(null);

  // Variáveis booleanas para facilitar e não errarmos mais o nome da Role
  const isAgency = userRole === "AGENCY" || userRole === "AGENCY_ADMIN" || userRole?.includes("AGENCY");
  const isAdmin = userRole === "ADMIN";
  const isRealtor = userRole === "REALTOR";
  const isOwner = userRole === "OWNER";

  // =========================================================================
  // 1. BUSCA DE DADOS CORRETA BASEADA NO CARGO (ROLE)
  // =========================================================================
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["properties-management", userId, userRole],
    queryFn: async () => {
      if (!userId) return [];
      
      return await propertyService.getPropertiesByUserId(userId); 
    },
    enabled: !!userId,
  });

  // =========================================================================
  // REGRAS DE NEGÓCIO: FILTROS BASEADOS NO CARGO
  // =========================================================================
  const getFilterTabs = () => {
    if (isAdmin || isAgency) {
      return [
        { key: "ALL", label: "Todos" },
        { key: "PENDING", label: "Fila de Avaliação" },
        { key: "ACTIVE", label: "Ativos" },
        { key: "REJECTED", label: "Rejeitados" },
        { key: "PAUSED", label: "Pausados" },
        { key: "PLACED", label: "Alugados/Vendidos" },
      ];
    }
    if (isRealtor) {
      return [
        { key: "ALL", label: "Todos" },
        { key: "PENDING", label: "Pendentes" },
        { key: "ACTIVE", label: "Ativos" },
        { key: "REJECTED", label: "Rejeitados" },
        { key: "PAUSED", label: "Pausados" },
        { key: "PLACED", label: "Alugados/Vendidos" },
      ];
    }
    return [
      { key: "ALL", label: "Todos" },
      { key: "ACTIVE", label: "Ativos" },
      { key: "PAUSED", label: "Pausados" },
      { key: "PLACED", label: "Alugados/Vendidos" },
    ];
  };

  const filterTabs = getFilterTabs();
  
  const rawData = useMemo(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : (data.content || []);
  }, [data]);

  // =========================================================================
  // 2. FILTRAGEM LOCAL
  // =========================================================================
  const filteredData = useMemo(() => {
    if (activeFilter === "ALL") return rawData;

    return rawData.filter((item: PropertyResponse) => {
      const statusStr = item.status?.toUpperCase() || "";
      if (activeFilter === "PLACED") {
        return statusStr === "PLACED" || statusStr === "RENTED";
      }
      return statusStr === activeFilter;
    });
  }, [rawData, activeFilter]);

  // =========================================================================
  // 3. PAGINAÇÃO LOCAL
  // =========================================================================
  const paginatedData = useMemo(() => {
    const startIndex = pagination.pageIndex * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, pagination]);

  const columns = useMemo<ColumnDef<PropertyResponse>[]>(
    () => [
      {
        header: "IMÓVEL",
        id: "photo",
        cell: ({ row }) => {
          const coverPhoto = row.original.photoUrls?.[0];
          return (
            <PropertyCell>
              {coverPhoto ? (
                <img src={coverPhoto} alt="Capa do imóvel" />
              ) : (
                <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "#f8fafc", border: "1px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#9ca3af" }}>
                  S/ Foto
                </div>
              )}
            </PropertyCell>
          );
        },
      },
      {
        header: "TIPO",
        accessorKey: "type",
        cell: ({ row }) => {
          const types: Record<string, string> = {
            HOUSE: "Casa", APARTMENT: "Apartamento", STUDIO: "Studio", ROOM: "Quarto", KITNET: "Kitnet"
          };
          return types[row.original.type] || row.original.type;
        },
      },
      {
        header: "PREÇO",
        accessorKey: "priceInCents",
        cell: ({ row }) => {
          const price = row.original.priceInCents || 0;
          return (price / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        },
      },
      {
        header: "AÇÕES",
        id: "actions",
        cell: ({ row }) => {
          const isModerator = isAdmin || isAgency;
          const needsModeration = isModerator && row.original.status === "PENDING";

          return (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <ActionButton onClick={() => setSelectedProperty(row.original)}>
                {needsModeration ? "Avaliar Imóvel" : "Visualizar"}
              </ActionButton>
            </div>
          );
        },
      },
      {
        header: "STATUS",
        accessorKey: "status",
        cell: ({ row }) => {
          const rawStatus = row.original.status;
          if (!rawStatus) return <StatusBadge $status="UNKNOWN">Indefinido</StatusBadge>;

          const statusMap: Record<string, string> = {
            ACTIVE: "Ativos", PAUSED: "Pausados", PENDING: "Pendente",
            PLACED: "Alugados", RENTED: "Alugados", REJECTED: "Rejeitados",
          };

          const upperStatus = rawStatus.toUpperCase();
          const label = statusMap[upperStatus] || rawStatus;

          return <StatusBadge $status={upperStatus}>{label}</StatusBadge>;
        },
      },
    ],
    [isAdmin, isAgency]
  );

  return (
    <PageContainer style={{ paddingTop: '0' }}> {/* Removido o espaço vazio do topo */}

      <FilterContainer>
        <FilterLabel>Filtrar por:</FilterLabel>
        {filterTabs.map((tab) => {
          return (
            <FilterPill
              key={tab.key}
              $active={activeFilter === tab.key}
              onClick={() => {
                setActiveFilter(tab.key);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
            >
              {tab.label}
            </FilterPill>
          );
        })}
      </FilterContainer>

      <ContentSection>
        {isLoading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>Carregando imóveis...</div>
        ) : isError ? (
          <div style={{ padding: "3rem", textAlign: 'center', color: '#ef4444' }}>Erro ao carregar imóveis.</div>
        ) : (
          <Table
            columns={columns}
            data={paginatedData}
            pagination={pagination}
            setPagination={setPagination}
            totalItems={filteredData.length}
          />
        )}
      </ContentSection>

      {selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          isOpen={!!selectedProperty}
          onClose={() => {
            setSelectedProperty(null);
            refetch(); // Recarrega os dados caso o status tenha sido alterado no Modal
          }}
          userRole={userRole}
        />
      )}
    </PageContainer>
  );
}