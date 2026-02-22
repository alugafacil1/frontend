import React from 'react';
import Header from "@/components/Header";

// Importando o CSS
import "@/assets/styles/ads/AdsLayout.css";

interface AdsLayoutProps {
  children: React.ReactNode;
}

export default function AdsLayout({ children }: AdsLayoutProps) {
  return (
    <div className="ads-layout-container">
      <Header />

      <main className="ads-main-content">
        {children}
      </main>
    </div>
  );
}