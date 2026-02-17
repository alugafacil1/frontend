import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import type { UserResponse } from "@/types/user";

interface SpringPageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
}

export function useUsers(page: number, size: number) {
    return useQuery({
        queryKey: ["users", page, size],
        queryFn: async () => {
            const { data } = await api.get<SpringPageResponse<UserResponse>>(
                `/api/users?page=${page}&size=${size}`
            );
            return data;
        },
        placeholderData: (previousData) => previousData,
    });
}

export function useUser(userId: string, enabled: boolean = true) {
    return useQuery({
        queryKey: ["user", userId],
        queryFn: async () => {
            const { data } = await api.get<UserResponse>(`/api/users/${userId}`); 
            return data;
        },
        enabled: !!userId && enabled,
    });
}

interface UpdateUserStatusParams {
    id: string;
    status: 'ACTIVE' | 'BLOCKED' | 'INACTIVE';
}

export function useUpdateUserStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status }: UpdateUserStatusParams) => {
            const { data } = await api.patch(`/api/users/${id}/status`, { status });
            return data;
        },
        onSuccess: () => {
            // Atualiza a tabela imediatamente após bloquear/desbloquear
            queryClient.invalidateQueries({ queryKey: ["users"] });
        }
    });
}