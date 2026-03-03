"use client";

import { useMemo, useState } from "react";
import { Table } from "@/components/table/Table";
import { useProperties, useUpdatePropertyStatus } from "@/services/queries/Properties";
import { StatusBadge } from "../styles";
import type { ColumnDef } from "@tanstack/react-table";
import type { PropertyResponse, PropertyStatus } from "@/types/property";

import { PropertyDetailsModal } from "./PropertyDetailsModal"; 

interface PropertyManagementProps {
    userId?: string;
    userRole?: string;
}

export function PropertyManagement({ userId, userRole }: PropertyManagementProps) {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    
    // 1. NOVO ESTADO: O Filtro de Status
    const [activeFilter, setActiveFilter] = useState<PropertyStatus | 'ALL'>('ALL');
    
    const [selectedProperty, setSelectedProperty] = useState<PropertyResponse | null>(null);

    // 2. PASSANDO O FILTRO PRO HOOK (Como o 5º parâmetro que criamos)
    const { data, isLoading, isError } = useProperties(
        pagination.pageIndex,
        pagination.pageSize,
        userId,
        userRole,
        activeFilter
    );

    const { mutate: updateStatus, isPending } = useUpdatePropertyStatus();

    const handleApprove = (id: string) => {
        updateStatus({ id, status: "ACTIVE" });
        setSelectedProperty(null);
    };  

    const handleReject = (id: string) => {
        // Num fluxo real, você poderia abrir um prompt aqui pedindo o `reason` (motivo da rejeição)
        updateStatus({ id, status: "REJECTED", reason: "Não atende aos critérios da plataforma." });
        setSelectedProperty(null);
    };

    const columns = useMemo<ColumnDef<PropertyResponse>[]>(() => [
        {
            header: "Imóvel",
            accessorKey: "title",
            cell: ({ row }) => {
                const coverPhoto = row.original.photoUrls?.[0]; 
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {coverPhoto ? (
                            <img 
                                src={coverPhoto} 
                                alt={row.original.title} 
                                style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                            />
                        ) : (
                            <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#6b7280' }}>
                                S/ Foto
                            </div>
                        )}
                        <span style={{ fontWeight: 500 }}>{row.original.title}</span>
                    </div>
                );
            }
        },
        {
            header: "Tipo",
            accessorKey: "type",
            cell: ({ row }) => {
                const types: Record<string, string> = {
                    HOUSE: "Casa", APARTMENT: "Apartamento", STUDIO: "Studio"
                };
                return types[row.original.type] || row.original.type;
            }
        },
        {
            header: "Preço",
            accessorKey: "priceInCents",
            cell: ({ row }) => (row.original.priceInCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        },
        {
            header: "Status",
            accessorKey: "status",
            // Mantendo o seu badge original e elegante
            cell: ({ row }) => <StatusBadge $status={row.original.status}>{row.original.status}</StatusBadge>
        },
        {
            header: "Ações",
            id: "actions",
            cell: ({ row }) => {
                // Lógica de UX: Se for Admin e o imóvel estiver pendente, o botão muda de cor e texto para chamar atenção!
                const needsModeration = userRole === "ADMIN" && row.original.status === 'PENDING';
                
                return (
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                            onClick={() => setSelectedProperty(row.original)}
                            style={{ 
                                color: needsModeration ? '#ea580c' : '#059669', // Laranja se precisar avaliar, Verde se for só visualizar
                                background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 
                            }}
                        >
                            {needsModeration ? 'Avaliar Imóvel' : 'Visualizar'}
                        </button>
                        
                        {userRole !== "ADMIN" && (
                            <>
                                <button style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Editar</button>
                                <button style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Excluir</button>
                            </>
                        )}
                    </div>
                );
            }
        }
    ], [userRole]);

    // 3. Função para renderizar os Pills (Filtros Rápidos)
    const renderFilterPill = (status: PropertyStatus | 'ALL', label: string) => {
        const isActive = activeFilter === status;
        return (
            <button
                onClick={() => {
                    setActiveFilter(status);
                    setPagination(prev => ({ ...prev, pageIndex: 0 })); // Reseta a paginação ao filtrar
                }}
                style={{
                    padding: '6px 16px', borderRadius: '20px',
                    border: isActive ? 'none' : '1px solid #d1d5db',
                    backgroundColor: isActive ? '#2563eb' : '#fff',
                    color: isActive ? '#fff' : '#4b5563',
                    fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: isActive ? '0 2px 4px rgba(37, 99, 235, 0.2)' : 'none'
                }}
            >
                {label}
            </button>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* 4. BARRA DE FILTROS SUPERIOR */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', paddingBottom: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginRight: '8px' }}>Filtrar por:</span>
                {renderFilterPill('ALL', 'Todos')}
                {renderFilterPill('PENDING', userRole === "ADMIN" ? '🟠 Fila de Avaliação' : '🟠 Em Análise')}
                {renderFilterPill('ACTIVE', '🟢 Ativos')}
                {renderFilterPill('REJECTED', '🔴 Rejeitados')}
                {renderFilterPill('PAUSED', '⏸️ Pausados')}
                {renderFilterPill('PLACED', '🔵 Alugados/Vendidos')}
            </div>

            {/* TABELA ORIGINAL */}
            {isLoading ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>Carregando imóveis...</div>
            ) : isError ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'red' }}>Erro ao carregar imóveis.</div>
            ) : (
                <Table 
                    columns={columns} 
                    data={data?.content || []} 
                    pagination={pagination}
                    setPagination={setPagination}
                    totalItems={data?.totalElements || 0}
                />
            )}

            {/* O SEU MODAL ORIGINAL */}
            {selectedProperty && (
                <PropertyDetailsModal
                    property={selectedProperty}
                    isOpen={!!selectedProperty}
                    onClose={() => setSelectedProperty(null)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    isAdmin={userRole === "ADMIN"}
                />
            )}
        </div>
    );
}