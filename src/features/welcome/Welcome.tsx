"use client";

import { useAuth } from "@/lib/auth/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header"; 

export default function Welcome() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <Header />

      <main style={{ paddingTop: "80px" }}>
        
        <div className="landing-container" style={{ paddingTop: "40px", paddingBottom: "40px" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h1 style={{ fontSize: "32px", color: "#1a1a2e", marginBottom: "16px" }}>
              Olá, <span style={{ color: "#515def" }}>{user.name}</span>!
            </h1>
            <p style={{ color: "#6b7280", fontSize: "18px" }}>
              O que você deseja encontrar hoje?
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}