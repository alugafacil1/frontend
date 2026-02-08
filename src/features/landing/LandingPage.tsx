"use client";

import Header from "@/components/Header";
import SearchForm from "@/components/SearchForm";
import FeaturedAds, { Property } from "@/components/FeaturedAds";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import LatestUpdates, { CardItem } from "@/components/LatestUpdates";
import FAQ from "@/components/FAQ";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

// Mock de dados para FeaturedAds na LandingPage (página pública)
const landingProperties: Property[] = [
  {
    id: 1,
    title: "Melton Road, Leicester",
    location: "Is simply dummy text of the and typesetting",
    type: "apartment",
    bedrooms: 3,
    bathrooms: 2,
  },
  {
    id: 2,
    title: "Hamilton, Leicester",
    location: "Is simply dummy text of the and typesetting",
    type: "house",
    bedrooms: 3,
    bathrooms: 2,
  },
  {
    id: 3,
    title: "Uppingham Road, Leicester",
    location: "Is simply dummy text of the and typesetting",
    type: "apartment",
    bedrooms: 3,
    bathrooms: 2,
  },
  {
    id: 4,
    title: "City Center, Leicester",
    location: "Is simply dummy text of the and typesetting",
    type: "kitnet",
    bedrooms: 1,
    bathrooms: 1,
  },
  {
    id: 5,
    title: "Oadby, Leicester",
    location: "Is simply dummy text of the and typesetting",
    type: "house",
    bedrooms: 4,
    bathrooms: 3,
  },
  {
    id: 6,
    title: "City Center, Leicester",
    location: "Is simply dummy text of the and typesetting",
    type: "apartment",
    bedrooms: 2,
    bathrooms: 2,
  },
  {
    id: 7,
    title: "Hamilton, Leicester",
    location: "Is simply dummy text of the and typesetting",
    type: "kitnet",
    bedrooms: 1,
    bathrooms: 1,
  },
  {
    id: 8,
    title: "City Center, Leicester",
    location: "Is simply dummy text of the and typesetting",
    type: "house",
    bedrooms: 3,
    bathrooms: 2,
  },
];

const mockAgents: CardItem[] = [
  {
    id: 1,
    name: "Jaydon George",
    rating: 4.9,
    title: "Senior Real Estate Advisor",
    location: "Paris",
    propertiesSold: 432,
  },
  {
    id: 2,
    name: "Jane Doe",
    rating: 4.8,
    title: "Real Estate Consultant",
    location: "London",
    propertiesSold: 356,
  },
  {
    id: 3,
    name: "Gustavo Bator",
    rating: 4.7,
    title: "Property Specialist",
    location: "Manchester",
    propertiesSold: 289,
  },
  {
    id: 4,
    name: "Haylie Philips",
    rating: 4.9,
    title: "Senior Real Estate Advisor",
    location: "Madrid",
    propertiesSold: 521,
  },
  {
    id: 5,
    name: "Alex Johnson",
    rating: 4.6,
    title: "Real Estate Agent",
    location: "Berlin",
    propertiesSold: 234,
  },
  {
    id: 6,
    name: "Maria Silva",
    rating: 4.8,
    title: "Property Consultant",
    location: "Lisbon",
    propertiesSold: 398,
  },
];

export default function LandingPage() {
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
        properties={landingProperties}
        title="Anúncios com Destaque"
        subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco"
      />

      {/* Features Section */}
      <FeaturesSection />

      {/* Latest Updates */}
      <LatestUpdates
        title="Últimas atualizações"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna."
        items={mockAgents}
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
