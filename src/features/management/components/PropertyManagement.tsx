"use client";

import { useMemo, useState } from "react";
import { Table } from "@/components/table/Table";
import { useProperties, useUpdatePropertyStatus } from "@/services/queries/Properties";
import { StatusBadge } from "../styles";
import type { ColumnDef } from "@tanstack/react-table";
import type { PropertyResponse } from "@/types/property";

import { PropertyDetailsModal } from "./PropertyDetailsModal"; 

interface PropertyManagementProps {
    userId?: string;
    userRole?: string;
}

export function PropertyManagement({ userId, userRole }: PropertyManagementProps) {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    
    const [selectedProperty, setSelectedProperty] = useState<PropertyResponse | null>(null);

    const { data, isLoading, isError } = useProperties(
        pagination.pageIndex,
        pagination.pageSize,
        userId,
        userRole
    );

    const { mutate: updateStatus, isPending } = useUpdatePropertyStatus();

    const handleApprove = (id: string) => {
        updateStatus({ id, status: "ACTIVE" });
        setSelectedProperty(null);
    };  

    const handleReject = (id: string) => {
        updateStatus({ id, status: "REJECTED" });
        setSelectedProperty(null);
    };

    const columns = useMemo<ColumnDef<PropertyResponse>[]>(() => [
        {
            header: "Título",
            accessorKey: "title",
            cell: ({ row }) => <span style={{ fontWeight: 500 }}>{row.original.title}</span>
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
            cell: ({ row }) => <StatusBadge $status={row.original.status}>{row.original.status}</StatusBadge>
        },
        {
            header: "Ações",
            id: "actions",
            cell: ({ row }) => (
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={() => setSelectedProperty(row.original)}
                        style={{ color: '#059669', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                        Visualizar
                    </button>
                    
                    {userRole !== "ADMIN" && (
                        <>
                            <button style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Editar</button>
                            <button style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Excluir</button>
                        </>
                    )}
                </div>
            )
        }
    ], [userRole]);

    if (isLoading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Carregando imóveis...</div>;
    if (isError) return <div style={{ padding: '3rem', textAlign: 'center', color: 'red' }}>Erro ao carregar imóveis.</div>;

    return (
        <>
            <Table 
                columns={columns} 
                data={data?.content || []} 
                pagination={pagination}
                setPagination={setPagination}
                totalItems={data?.totalElements || 0}
            />

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
        </>
    );
}