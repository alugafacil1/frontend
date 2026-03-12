"use client";

import { useAuth } from "@/lib/auth/useAuth";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import SearchForm, { SearchFilters } from "@/components/SearchForm";
import FeaturedAds, { Property } from "@/components/FeaturedAds";
import LatestUpdates, { CardItem } from "@/components/LatestUpdates";
import Footer from "@/components/Footer";
import { useRecentProperties, useTopPropertiesByViews } from "@/services/queries/Properties";
import {
  transformPropertyResponsesToProperties,
  transformPropertyResponsesToCardItems
} from "@/utils/propertyTransformers";
import { RENT_RANGES } from "@/components/SearchForm";

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { data: recentProperties, isLoading: isLoadingProperties } = useRecentProperties();
  const { data: topByViewsProperties } = useTopPropertiesByViews();
  const [filters, setFilters] = useState<SearchFilters>({ location: "", date: "", propertyType: "", rentRange: "" });
  const [searchResetKey, setSearchResetKey] = useState(0);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  const filteredRecent = useMemo(() => {
    if (!recentProperties) return [];
    return recentProperties.filter((p) => {
      if (filters.location && p.address.city !== filters.location) return false;
      if (filters.propertyType && p.type !== filters.propertyType) return false;
      if (filters.rentRange) {
        const range = RENT_RANGES.find((r) => r.value === filters.rentRange);
        if (range && (p.priceInCents < range.min || p.priceInCents >= range.max)) return false;
      }
      return true;
    });
  }, [recentProperties, filters]);

  // Transforma os dados da API para o formato esperado pelo componente FeaturedAds
  const properties: Property[] = useMemo(() => {
    return transformPropertyResponsesToProperties(filteredRecent);
  }, [filteredRecent]);

  // Transforma os dados da API para o formato esperado pelo componente LatestUpdates
  const latestUpdatesItems: CardItem[] = useMemo(() => {
    if (!recentProperties) return [];
    return transformPropertyResponsesToCardItems(recentProperties);
  }, [recentProperties]);

  const mostViewedItems: CardItem[] = useMemo(() => {
    if (!topByViewsProperties) return [];
    return transformPropertyResponsesToCardItems(topByViewsProperties);
  }, [topByViewsProperties]);

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
      <SearchForm properties={recentProperties ?? []} onSearch={setFilters} resetKey={searchResetKey} />

      {/* Featured Ads */}
      <FeaturedAds
        properties={properties}
        title="Anúncios Recentes"
        subtitle="Confira os anúncios mais recentes disponíveis para locação"
        onTabChange={() => { setFilters({ location: "", date: "", propertyType: "", rentRange: "" }); setSearchResetKey((k) => k + 1); }}
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
      
    </div>
  );
}
