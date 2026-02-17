import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PropertyResponse, PropertyStatus } from "@/types/property";
import api from "../api";

interface SpringPageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export function useProperties(page: number, size: number, userId?: string, role?: string, status?: PropertyStatus | 'ALL') {
  return useQuery({
    queryKey: ["properties", page, size, userId, role, status],
    queryFn: async () => {
      if (role === "OWNER" && userId) {
        const { data } = await api.get<PropertyResponse[]>(
          `/api/properties/owner/${userId}`
        );
        
        return {
          content: data,
          totalElements: data.length,
          totalPages: 1,
          number: 0
        } as SpringPageResponse<PropertyResponse>;
      }

      const params: Record<string, any> = { 
        page, 
        size, 
        sort: "createdAt,desc" 
      };

      if (status && status !== 'ALL') {
          params.status = status;
      }

      const { data } = await api.get<SpringPageResponse<PropertyResponse>>(
        "/api/properties",
        { params }
      );
      return data;
    },
    placeholderData: (previousData) => previousData,
  });
}

interface UpdateStatusParams {
    id: string;
    status: string;
    reason?: string;
}

export function useUpdatePropertyStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status, reason }: UpdateStatusParams) => {
            const { data } = await api.patch(`/api/properties/${id}/status`, { 
                status, 
                reason 
            });
            return data;
        },
        onSuccess: () => {
            // Atualiza a tabela na mesma hora em que o status mudar
            queryClient.invalidateQueries({ queryKey: ["properties"] });
        }
    });
}