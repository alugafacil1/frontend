"use client";

import Header from "@/components/Header";
import SearchForm from "@/components/SearchForm";
import FeaturedListings from "@/components/FeaturedListings";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import LatestUpdates from "@/components/LatestUpdates";
import FAQ from "@/components/FAQ";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

export default function LandingPage() {
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

      {/* Features Section */}
      <FeaturesSection />

      {/* Latest Updates */}
      <LatestUpdates />

      {/* FAQ Section */}
      <FAQ />

      {/* Call to Action */}
      <CallToAction />

      {/* Footer */}
      <Footer />
    </div>
  );
}
