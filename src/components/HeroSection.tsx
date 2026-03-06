"use client";

export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1 className="hero-title">
          O seu próximo imóvel
          <br />
          Está <span className="highlight">Aqui</span>
        </h1>
        <p className="hero-subtitle">
          Encontre o lar ideal com o AlugaFácil. Uma plataforma segura, rápida e sem burocracia para você dar o próximo passo com tranquilidade.
        </p>
      </div>
    </section>
  );
}