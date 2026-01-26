"use client";

import Header from "@/components/Header";
import SearchForm from "@/components/SearchForm";
import FeaturedListings from "@/components/FeaturedListings";

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            Let's Begin Your Journey
            <br />
            With <span className="highlight">Us</span>
          </h1>
          <p className="hero-subtitle">
            Find your desirable accommodation with StudentHub which provides you secure and fast process to
            start your new journey
          </p>
        </div>
      </section>

      {/* Search Form */}
      <SearchForm />

      {/* Featured Listings */}
      <FeaturedListings />
    </div>
  );
}
