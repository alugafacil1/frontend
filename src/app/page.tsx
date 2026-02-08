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
    if (!loading && isAuthenticated) {
      router.replace("/home");
    }
  }, [isAuthenticated, loading, router]);

  if (loading || isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
      </div>
    );
  }

  return <LandingPage />;
}