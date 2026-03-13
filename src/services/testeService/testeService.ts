import { Iteste } from "@/types/teste.types";
import { api } from "../../lib/utils/api";

export const postService = {
  getAll: async (): Promise<Iteste[]> => {
    const { data } = await api.get("/posts");
    return data;
  },

  getById: async (id: number): Promise<Iteste> => {
    const { data } = await api.get(`/posts/${id}`);
    return data;
  }
};