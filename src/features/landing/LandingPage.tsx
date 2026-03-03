"use client";

import { useMemo } from "react";
import Header from "@/components/Header";
import SearchForm from "@/components/SearchForm";
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
      <Footer />
    </div>
  );
}
