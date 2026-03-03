"use client";

import { useMemo, useState } from "react";
import { Table } from "@/components/table/Table";
import { useAgencies } from "@/services/queries/Agencies";
import type { ColumnDef } from "@tanstack/react-table";
import type { AgencyResponse } from "@/types/agency";

import { AgencyDetailsModal } from "./AgencyDetailsModal"; 

export function AgencyManagement() {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [selectedAgency, setSelectedAgency] = useState<AgencyResponse | null>(null);
  
    const { data, isLoading, isError } = useAgencies(pagination.pageIndex, pagination.pageSize);

    // Função auxiliar para mascarar o CNPJ na tabela
    const formatCNPJ = (cnpj: string) => {
        if (!cnpj) return "---";
        return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    };

    const columns = useMemo<ColumnDef<AgencyResponse>[]>(() => [
        {
            header: "Imobiliária",
            accessorKey: "name",
            cell: ({ row }) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {row.original.photoUrl ? (
                        <img 
                            src={row.original.photoUrl} 
                            alt={row.original.name} 
                            style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e5e7eb' }}
                        />
                    ) : (
                        <div style={{ 
                            width: '36px', height: '36px', borderRadius: '8px', 
                            background: '#f3e8ff', color: '#7e22ce', display: 'flex', 
                            alignItems: 'center', justifyContent: 'center', 
                            fontSize: '14px', fontWeight: 'bold' 
                        }}>
                            {row.original.name.substring(0, 2).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <div style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>{row.original.name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{row.original.email}</div>
                    </div>
                </div>
            )
        },
        {
            header: "CNPJ",
            accessorKey: "cnpj",
            cell: ({ getValue }) => (
                <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#4b5563' }}>
                    {formatCNPJ(getValue() as string)}
                </span>
            )
        },
        {
            header: "Equipe (Assentos)",
            id: "team_size",
            cell: ({ row }) => {
                const teamCount = row.original.members?.length || 0;
                return (
                    <span style={{ 
                        background: '#f3f4f6', 
                        padding: '4px 10px', 
                        borderRadius: '12px', 
                        fontSize: '12px', 
                        fontWeight: 600, 
                        color: '#374151' 
                    }}>
                        {teamCount} {teamCount === 1 ? 'membro' : 'membros'}
                    </span>
                );
            }
        },
        {
            header: "Telefone",
            accessorKey: "phoneNumber",
            cell: ({ getValue }) => (getValue() as string) || "---"
        },
        {
            header: "Ações",
            id: "actions",
            cell: ({ row }) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                        onClick={() => setSelectedAgency(row.original)}
                        style={{ 
                            background: 'none', border: 'none', color: '#2563eb', 
                            cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                            padding: '4px'
                        }}
                    >
                        Gerenciar
                    </button>
                </div>
            )
        }
    ], []);

    if (isLoading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>Buscando imobiliárias no servidor...</div>;
    if (isError) return <div style={{ padding: '3rem', textAlign: 'center', color: '#dc2626' }}>Ocorreu um erro ao carregar as agências.</div>;

    return (
        <>
            <Table 
                columns={columns} 
                data={data?.content || []} 
                pagination={pagination}
                setPagination={setPagination}
                totalItems={data?.totalElements || 0}
            />

            {selectedAgency && (
                <AgencyDetailsModal 
                    agency={selectedAgency} 
                    isOpen={!!selectedAgency} 
                    onClose={() => setSelectedAgency(null)} 
                />
            )}
        </>
    );
}