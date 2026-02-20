"use client";

import LandingPage from "@/features/landing/LandingPage";
import "@/assets/styles/landing/index.css";
import { useAuth } from "@/lib/auth/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Só redireciona para /home se estiver autenticado
    // Não bloqueia a exibição da landing page
    if (!loading && isAuthenticated) {
      router.replace("/home");
    }
  }, [isAuthenticated, loading, router]);

  // Sempre mostra a landing page (pública)
  // Se estiver autenticado, o useEffect acima vai redirecionar
  return <LandingPage />;
}