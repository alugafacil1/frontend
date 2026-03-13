"use client";

import { useMemo, useState } from "react";
import { Table } from "@/components/table/Table";
import { useMembers } from "@/services/queries/Realtors";
import type { ColumnDef } from "@tanstack/react-table";
import type { RealtorResponse } from "@/types/realtor";
import { RealtorDetailsModal } from "./RealtorDetailsModal";
import { useAuth } from "@/lib/auth/useAuth";
import { getImageUrl } from "@/utils/formatUrl";

interface RealtorManagementProps {
    agencyId?: string;
}

export function RealtorManagement({ agencyId }: RealtorManagementProps) {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [selectedRealtor, setSelectedRealtor] = useState<RealtorResponse | null>(null);
    const { user } = useAuth();
    const { data, isLoading, isError } = useMembers(agencyId, pagination.pageIndex, pagination.pageSize, user?.role);
    const columns = useMemo<ColumnDef<RealtorResponse>[]>(() => [
        {
            header: "Corretor",
            accessorKey: "name",
            cell: ({ row }) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {row.original.photoUrl ? (
                        <img
                            src={getImageUrl(row.original.photoUrl)}
                            alt={row.original.name}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: '#e0f2fe', color: '#0369a1', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: 'bold'
                        }}>
                            {row.original.name.charAt(0).toUpperCase()}
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
            header: "CRECI",
            accessorKey: "creciNumber",
            cell: ({ getValue }) => (getValue() as string) || "---"
        },
        {
            header: "Telefone",
            accessorKey: "phoneNumber",
            cell: ({ getValue }) => (getValue() as string) || "---"
        },
        {
            header: "Tipo",
            accessorKey: "userType",
            cell: ({ row }) => {
                const types: Record<string, { label: string, color: string, bg: string }> = {
                    AGENCY_ADMIN: { label: "Admin Agência", color: "#1e40af", bg: "#dbeafe" },
                    REALTOR: { label: "Corretor", color: "#065f46", bg: "#d1fae5" },
                };

                const currentType = row.original.userType || "REALTOR";
                const type = types[currentType] || { label: currentType, color: "#065f46", bg: "#d1fae5" };

                return (
                    <span style={{
                        color: type.color,
                        backgroundColor: type.bg,
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: '11px',
                        textTransform: 'uppercase'
                    }}>
                        {type.label}
                    </span>
                );
            }
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: ({ row }) => {
                const statuses: Record<string, { label: string, color: string, bg: string }> = {
                    ACTIVE: { label: "Ativo", color: "#166534", bg: "#dcfce3" },
                    BLOCKED: { label: "Bloqueado", color: "#991b1b", bg: "#fee2e2" },
                    INACTIVE: { label: "Inativo", color: "#374151", bg: "#f3f4f6" }
                };

                const currentStatus = row.original.status;
                const statusStyle = statuses[currentStatus] || { label: currentStatus || "---", color: "#374151", bg: "#f3f4f6" };

                return (
                    <span style={{
                        color: statusStyle.color,
                        backgroundColor: statusStyle.bg,
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: '11px',
                        textTransform: 'uppercase'
                    }}>
                        {statusStyle.label}
                    </span>
                );
            }
        },
        {
            header: "Imóveis",
            accessorKey: "propertiesCount",
            cell: ({ getValue }) => {
                const count = getValue() as number;
                return (
                    <span style={{ fontWeight: 600, color: '#4b5563' }}>
                        {count} {count === 1 ? 'imóvel' : 'imóveis'}
                    </span>
                );
            }
        },
        {
            header: "Ações",
            id: "actions",
            cell: ({ row }) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setSelectedRealtor(row.original)}
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

    if (isLoading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>Buscando corretores no servidor...</div>;
    if (isError) return <div style={{ padding: '3rem', textAlign: 'center', color: '#dc2626' }}>Ocorreu um erro ao carregar os corretores.</div>;

    return (
        <>
            <Table
                columns={columns}
                data={data?.content || []}
                pagination={pagination}
                setPagination={setPagination}
                totalItems={data?.totalElements || 0}
            />

            {selectedRealtor && (
                <RealtorDetailsModal
                    realtor={selectedRealtor}
                    isOpen={!!selectedRealtor}
                    onClose={() => setSelectedRealtor(null)}
                />
            )}
        </>
    );
}