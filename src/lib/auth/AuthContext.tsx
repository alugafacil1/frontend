"use client";

import { createContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/services/auth/authService";
import { User, LoginResponse, AuthContextType } from "@/types/auth";

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const API_URL = "http://localhost:8081/api"; 

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          const parsedUser: User = JSON.parse(savedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Error recovering session:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  async function login(email: string, password: string) {
    setLoading(true);

    try {
      const data = await auth.login(email, password) as LoginResponse; 
      
      if (!data || !data.access_token) {
        throw new Error("Token não fornecido pela API.");
      }

      const token = data.access_token;
      const userResponse = await fetch(`${API_URL}/users/me`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!userResponse.ok) {
        throw new Error("Falha ao buscar dados do perfil do usuário.");
      }

      const fullUserData = await userResponse.json();

      const userData: User = {
        id: fullUserData.userId,
        name: fullUserData.name,
        email: fullUserData.email,
        role: fullUserData.userType,
        photoUrl: fullUserData.photoUrl,
        phoneNumber: fullUserData.phoneNumber,
        cpf: fullUserData.cpf
      };

      setUser(userData);
      setIsAuthenticated(true);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      
      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Strict`;

      console.log("Login Sucesso. Dados completos:", userData);
      router.push("/home");
      
    } catch (error: unknown) { 
      if (error instanceof Error) {
        console.error("Erro no login:", error.message);
      } else {
        console.error("Erro desconhecido no login:", error);
      }
      throw error; 
    } finally {
      setLoading(false);
    }
  }

  async function signUp(name : string, email : string, phone : string, cpf : string, type : string, password : string) {
    setLoading(true);

    try {
      await auth.signUp(name, email, phone, cpf, type, password);
      router.push("/login");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Erro no cadastro:", error.message);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    // Usa window.location para garantir que o middleware não intercepte
    window.location.href = "/";
  }

  const updateUser = (newUserData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...newUserData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, logout, signUp, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}