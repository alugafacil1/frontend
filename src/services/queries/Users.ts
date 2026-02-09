import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";

export function useUsers(page: number, size: number) {
    return useQuery({
        queryKey: ["users", page, size],
        queryFn: async () => {
            const response = await api.get(`/api/users?page=${page}&size=${size}`);
            return response.data;
        }
    });
}