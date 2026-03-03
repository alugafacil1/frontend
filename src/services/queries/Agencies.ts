import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AgencyResponse, PaginatedAgencyResponse, AgencyRequest } from "@/types/agency";
import api from "../api";

export function useAgencies(page: number, size: number) {
    return useQuery({
        queryKey: ["agencies", page, size],
        queryFn: async () => {
            const { data } = await api.get<PaginatedAgencyResponse>('/api/realStateAgencies', {
                params: { page, size }
            });
            return data;
        }
    });
}

export function useAgency(id: string) {
    return useQuery({
        queryKey: ["agency", id],
        queryFn: async () => {
            const { data } = await api.get<AgencyResponse>(`/api/realStateAgencies/${id}`);
            return data;
        },
        enabled: !!id,
    });
}

export function useCreateAgency() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: AgencyRequest) => {
            const { data } = await api.post<AgencyResponse>('/api/realStateAgencies', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["agencies"] });
        }
    });
}

export function useUpdateAgency() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: string, payload: AgencyRequest }) => {
            const { data } = await api.put<AgencyResponse>(`/api/realStateAgencies/${id}`, payload);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["agencies"] });
            queryClient.invalidateQueries({ queryKey: ["agency", variables.id] });
        }
    });
}

export function useDeleteAgency() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/api/realStateAgencies/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["agencies"] });
        }
    });
}

export function useAddAgencyMember() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ agencyId, userId, actingUserId }: { agencyId: string, userId: string, actingUserId: string }) => {
            await api.post(`/api/realStateAgencies/${agencyId}/members/${userId}`, null, {
                headers: { 'X-User-Id': actingUserId }
            });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["agency", variables.agencyId] });
            queryClient.invalidateQueries({ queryKey: ["agencies"] });
        }
    });
}

export function useRemoveAgencyMember() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ agencyId, userId, actingUserId }: { agencyId: string, userId: string, actingUserId: string }) => {
            await api.delete(`/api/realStateAgencies/${agencyId}/members/${userId}`, {
                headers: { 'X-User-Id': actingUserId }
            });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["agency", variables.agencyId] });
            queryClient.invalidateQueries({ queryKey: ["agencies"] });
        }
    });
}

export function useTransferProperty() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ agencyId, propertyId, targetUserId, actingUserId }: { agencyId: string, propertyId: string, targetUserId: string, actingUserId: string }) => {
            await api.post(`/api/realStateAgencies/${agencyId}/properties/${propertyId}/transfer`, 
                { targetUserId },
                { headers: { 'X-User-Id': actingUserId } }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["properties"] });
        }
    });
}