"use client";

import { useAuth } from "@/lib/auth/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/button";
import "@/assets/styles/welcome/index.css";

export default function Welcome() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !user) {
    return (
        <div className="welcome-page">
            <p>Carregando...</p>
        </div>
    );
  }

  return (
    <div className="welcome-page">
      <div className="welcome-card">
        <h1 className="welcome-title">Bem-vindo(a), {user.name}!</h1>
        
        <p className="welcome-text">
          Seu perfil é: <strong className="uppercase">{user.role}</strong>
        </p>
        
        <Button 
          onClick={logout}
          className="w-full logout-button"
        >
          Sair
        </Button>
      </div>
    </div>
  );
}