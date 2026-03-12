import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "@/services/api"; 
import type { RealtorResponse } from "@/types/realtor";

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

interface TransferAllPayload {
  agencyId: string;
  fromRealtorId: string;
  toRealtorId: string;
  actingUserId: string;
}

export function useAgencyMembers(agencyId: string | undefined, pageIndex: number, pageSize: number) {
  return useQuery({
    queryKey: ["agency-members", agencyId, pageIndex, pageSize],
    
    queryFn: async () => {
      if (!agencyId) throw new Error("ID da agência não fornecido");

      const params = new URLSearchParams({
        page: pageIndex.toString(),
        size: pageSize.toString(),
        userType: "REALTOR"
      });

      const response = await api.get<PaginatedResponse<RealtorResponse>>(
        `/api/realStateAgencies/${agencyId}/members?${params.toString()}`
      );
      
      return response.data;
    },
    enabled: !!agencyId,
  });
}

export function useMembers(agencyId: string | undefined, pageIndex: number, pageSize: number, role: string | undefined) {
  const isAdmin = role === "ADMIN";

  return useQuery({
    queryKey: ["members", isAdmin ? "all" : agencyId, pageIndex, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: pageIndex.toString(),
        size: pageSize.toString(),
      });

      const url = isAdmin 
        ? `/api/realStateAgencies/realtors/all` 
        : `/api/realStateAgencies/${agencyId}/members`;

      const response = await api.get<PaginatedResponse<RealtorResponse>>(`${url}?${params}`);
      return response.data;
    },
    enabled: isAdmin || !!agencyId,
  });
}

export function useTransferAllProperties() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ agencyId, fromRealtorId, toRealtorId, actingUserId }: TransferAllPayload) => {
      const response = await api.post(`/api/realStateAgencies/${agencyId}/properties/transfer-all`, 
        {
          fromRealtorId,
          toRealtorId,
        },
        {
          headers: {
            'X-User-Id': actingUserId
          }
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agency-members", variables.agencyId] });
    },
  });
}

interface RegisterRealtorPayload {
  name: string;
  email: string;
  cpf: string;
  creciNumber: string;
  phoneNumber: string;
  agencyId: string;
  actingUserId: string;
}

export function useRegisterRealtor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RegisterRealtorPayload) => {
      const response = await api.post('/api/realStateAgencies/members/register', 
        payload, 
        {
          headers: {
            'X-User-Id': payload.actingUserId
          }
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agency-members", variables.agencyId] });
    },
  });
}