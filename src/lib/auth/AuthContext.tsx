"use client";

import { createContext, useState, useEffect } from "react";
import { auth } from "@/services/auth/authService";

export const AuthContext = createContext<any>({});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Carrega usuário/tokens do localStorage ao abrir o app
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
  }, []);

  async function login(email: string, password: string) {
    setLoading(true);

    try {

      //Ajustar quando fizer a intregração


      /* const data = await auth.login(email, password);

      if (!data) {
        throw new Error("Erro ao fazer login");
      } */

      /* setUser(data.user);
      setIsAuthenticated(true); */

      // salva no localStorage
      /* localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user)); */
      document.cookie = `token=111; path=/;`;

      // redireciona
      window.location.href = "/";
    } catch (err: any) {
      console.error("Erro no login:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function signup(name : string, email : string, phone : string, cpf : string, type : string, password : string) {
    setLoading(true);

    try {

      //Ajustar quando fizer a intregração


      /* const data = await auth.signup(name, email, phone, cpf, type, password);

      if (!data) {
        throw new Error("Erro ao cadastrar");
      } */

      // redireciona
      window.location.href = "/login";
    } catch (err: any) {
      console.error("Erro no login:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    //Ajustar quando fizer a intregração
    /* setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = `token=111; path=/;`;
    window.location.href = "/login"; */
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
