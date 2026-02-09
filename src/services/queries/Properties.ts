import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { PropertyResponse } from "@/types/property";

interface SpringPageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export function useProperties(page: number, size: number, userId?: string, role?: string) {
  return useQuery({
    queryKey: ["properties", page, size, userId, role],
    queryFn: async () => {
      if (role === "OWNER" && userId) {
        const { data } = await axios.get<PropertyResponse[]>(
          `http://localhost:8081/api/properties/owner/${userId}`
        );
        
        return {
          content: data,
          totalElements: data.length,
          totalPages: 1,
          number: 0
        } as SpringPageResponse<PropertyResponse>;
      }

      const { data } = await axios.get<SpringPageResponse<PropertyResponse>>(
        "http://localhost:8081/api/properties",
        {
          params: { 
            page, 
            size,
            sort: "createdAt,desc" 
          }
        }
      );
      return data;
    },
    placeholderData: (previousData) => previousData,
  });
}