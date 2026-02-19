"use client";

import { useAuth } from "@/lib/auth/useAuth";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import SearchForm from "@/components/SearchForm";
import FeaturedAds, { Property } from "@/components/FeaturedAds";
import LatestUpdates, { CardItem } from "@/components/LatestUpdates";
import Footer from "@/components/Footer";
import { useRecentProperties } from "@/services/queries/Properties";
import { 
  transformPropertyResponsesToProperties,
  transformPropertyResponsesToCardItems 
} from "@/utils/propertyTransformers";

// Mock de dados para "Meus anúncios mais vistos" - será integrado com endpoint de visualizações
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

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { data: recentProperties, isLoading: isLoadingProperties } = useRecentProperties();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Transforma os dados da API para o formato esperado pelo componente FeaturedAds
  const properties: Property[] = useMemo(() => {
    if (!recentProperties) return [];
    return transformPropertyResponsesToProperties(recentProperties);
  }, [recentProperties]);

  // Transforma os dados da API para o formato esperado pelo componente LatestUpdates
  const latestUpdatesItems: CardItem[] = useMemo(() => {
    if (!recentProperties) return [];
    return transformPropertyResponsesToCardItems(recentProperties);
  }, [recentProperties]);

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

      {/* Featured Ads */}
      <FeaturedAds 
        properties={properties}
        title="Anúncios Recentes"
        subtitle="Confira os anúncios mais recentes disponíveis para locação"
      />

      {/* Meus anúncios mais vistos */}
      <LatestUpdates
        title="Meus anúncios mais vistos"
        description="Confira os anúncios que estão recebendo mais visualizações e interesse dos clientes."
        items={mostViewedItems}
      />

      {/* Últimas atualizações */}
      <LatestUpdates
        title="Últimas atualizações"
        description="Confira os anúncios mais recentes adicionados à nossa plataforma."
        items={latestUpdatesItems}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
