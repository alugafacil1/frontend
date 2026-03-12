"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import SearchForm, { SearchFilters, RENT_RANGES } from "@/components/SearchForm";
import FeaturedAds, { Property } from "@/components/FeaturedAds";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import LatestUpdates, { CardItem } from "@/components/LatestUpdates";
import FAQ from "@/components/FAQ";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import { useRecentProperties } from "@/services/queries/Properties";
import {
  transformPropertyResponsesToProperties,
  transformPropertyResponsesToCardItems
} from "@/utils/propertyTransformers";

export default function LandingPage() {
  const { data: recentProperties, isLoading, isError } = useRecentProperties();
  const [filters, setFilters] = useState<SearchFilters>({ location: "", date: "", propertyType: "", rentRange: "" });
  const [searchResetKey, setSearchResetKey] = useState(0);

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

      {/* Features Section */}
      <FeaturesSection />

      {/* Latest Updates */}
      <LatestUpdates
        title="Últimas atualizações"
        description="Confira os anúncios mais recentes adicionados à nossa plataforma."
        items={latestUpdatesItems}
      />

      {/* FAQ Section */}
      <FAQ />

      {/* Call to Action */}
      <CallToAction />

      {/* Footer */}
      
    </div>
  );
}
