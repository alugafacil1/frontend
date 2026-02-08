"use client";

import { useAuth } from "@/lib/auth/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import SearchForm from "@/components/SearchForm";
import FeaturedListings from "@/components/FeaturedListings";
import LatestUpdates, { CardItem } from "@/components/LatestUpdates";
import Footer from "@/components/Footer";

// Mock de dados para "Meus anúncios mais vistos"
const mostViewedItems: CardItem[] = [
  {
    id: 1,
    name: "Apartamento Centro",
    rating: 4.9,
    title: "Apartamento 2 quartos com varanda",
    location: "São Paulo, SP",
    propertiesSold: 1250,
  },
  {
    id: 2,
    name: "Casa Residencial",
    rating: 4.8,
    title: "Casa 3 quartos com quintal",
    location: "Rio de Janeiro, RJ",
    propertiesSold: 980,
  },
  {
    id: 3,
    name: "Studio Moderno",
    rating: 4.7,
    title: "Studio mobiliado próximo ao metrô",
    location: "Belo Horizonte, MG",
    propertiesSold: 750,
  },
  {
    id: 4,
    name: "Cobertura Luxo",
    rating: 5.0,
    title: "Cobertura 4 quartos com piscina",
    location: "Brasília, DF",
    propertiesSold: 2100,
  },
  {
    id: 5,
    name: "Casa Térrea",
    rating: 4.6,
    title: "Casa 2 quartos com garagem",
    location: "Curitiba, PR",
    propertiesSold: 650,
  },
  {
    id: 6,
    name: "Apartamento Alto Padrão",
    rating: 4.9,
    title: "Apartamento 3 quartos com sacada",
    location: "Porto Alegre, RS",
    propertiesSold: 1100,
  },
];

// Mock de dados para "Minhas últimas atualizações"
const latestUpdatesItems: CardItem[] = [
  {
    id: 1,
    name: "João Silva",
    rating: 4.9,
    title: "Corretor Senior",
    location: "São Paulo, SP",
    propertiesSold: 432,
  },
  {
    id: 2,
    name: "Maria Santos",
    rating: 4.8,
    title: "Consultora Imobiliária",
    location: "Rio de Janeiro, RJ",
    propertiesSold: 356,
  },
  {
    id: 3,
    name: "Pedro Costa",
    rating: 4.7,
    title: "Especialista em Propriedades",
    location: "Belo Horizonte, MG",
    propertiesSold: 289,
  },
  {
    id: 4,
    name: "Ana Oliveira",
    rating: 4.9,
    title: "Corretora Senior",
    location: "Brasília, DF",
    propertiesSold: 521,
  },
  {
    id: 5,
    name: "Carlos Mendes",
    rating: 4.6,
    title: "Agente Imobiliário",
    location: "Curitiba, PR",
    propertiesSold: 234,
  },
  {
    id: 6,
    name: "Julia Ferreira",
    rating: 4.8,
    title: "Consultora de Propriedades",
    location: "Porto Alegre, RS",
    propertiesSold: 398,
  },
];

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="landing-page">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Search Form */}
      <SearchForm />

      {/* Featured Listings */}
      <FeaturedListings />

      {/* Meus anúncios mais vistos */}
      <LatestUpdates
        title="Meus anúncios mais vistos"
        description="Confira os anúncios que estão recebendo mais visualizações e interesse dos clientes."
        items={mostViewedItems}
      />

      {/* Minhas últimas atualizações */}
      <LatestUpdates
        title="Minhas últimas atualizações"
        description="Veja as atualizações mais recentes do nosso sistema e novos anúncios adicionados."
        items={latestUpdatesItems}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
