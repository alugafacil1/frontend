import { api } from "../../lib/utils/api";

export const auth = {
  login: async (email: string, password: string) => {
    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });
      return data;
    } catch (error) {
      console.log(error);
    }
  },
  signup: async (name : string, email : string, phone : string, cpf : string, type : string, password : string) => {
    try {
      const { data } = await api.post("/auth/signup", {
        name, email, phone, cpf, type, password
      });
      return data;
    } catch (error) {
      console.log(error);
    }
  },
};