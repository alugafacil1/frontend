"use client";

import { useState, useRef, useEffect } from "react";

export interface CardItem {
  id: number | string;
  name: string;
  rating?: number;
  title: string;
  location: string;
  propertiesSold?: number;
  image?: string;
  [key: string]: any; // Permite propriedades adicionais para flexibilidade futura
}

interface LatestUpdatesProps {
  title: string; // Obrigatório: título deve ser fornecido pela página
  description: string; // Obrigatório: descrição deve ser fornecida pela página
  items: CardItem[]; // Obrigatório: dados devem ser fornecidos pela página
  cardsPerSlide?: number;
  renderCard?: (item: CardItem) => React.ReactNode; // Opcional: permite customização completa do card
}

const CARDS_PER_SLIDE = 4;

export default function LatestUpdates({
  title,
  description,
  items,
  cardsPerSlide = CARDS_PER_SLIDE,
  renderCard,
}: LatestUpdatesProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const totalSlides = Math.ceil(items.length / cardsPerSlide);

  const goToSlide = (slideIndex: number) => {
    if (slideIndex < 0 || slideIndex >= totalSlides) return;
    setCurrentSlide(slideIndex);
  };

  const nextSlide = () => {
    goToSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    goToSlide(currentSlide - 1);
  };

  useEffect(() => {
    const updateCarousel = () => {
      if (carouselRef.current && wrapperRef.current) {
        const wrapperWidth = wrapperRef.current.offsetWidth;
        const scrollAmount = currentSlide * wrapperWidth;
        carouselRef.current.style.transform = `translateX(-${scrollAmount}px)`;
        
        // Garante que cada card tenha exatamente a largura correta
        const gap = 24;
        const cardWidth = (wrapperWidth - (gap * (cardsPerSlide - 1))) / cardsPerSlide;
        const cards = carouselRef.current.querySelectorAll('.agent-card');
        cards.forEach((card) => {
          const cardElement = card as HTMLElement;
          cardElement.style.flex = `0 0 ${cardWidth}px`;
          cardElement.style.width = `${cardWidth}px`;
          cardElement.style.maxWidth = `${cardWidth}px`;
          cardElement.style.minWidth = `${cardWidth}px`;
        });
      }
    };

    // Pequeno delay para garantir que o DOM esteja renderizado
    const timeoutId = setTimeout(updateCarousel, 0);
    updateCarousel();
    window.addEventListener("resize", updateCarousel);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updateCarousel);
    };
  }, [currentSlide, cardsPerSlide, items.length]);

  const renderDefaultCard = (item: CardItem) => (
    <div key={item.id} className="agent-card">
      <div className="agent-image">
        {item.image ? (
          <img src={item.image} alt={item.name} className="agent-photo" />
        ) : (
          <div className="image-placeholder"></div>
        )}
      </div>
      <div className="agent-info">
        <div className="agent-header">
          <h3 className="agent-name">{item.name}</h3>
          {item.rating !== undefined && (
            <div className="agent-rating">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFD700" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <span>{item.rating}</span>
            </div>
          )}
        </div>
        <p className="agent-title">{item.title}</p>
        <div className="agent-details">
          <div className="agent-detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
                fill="#6b7280"
              />
            </svg>
            <span>{item.location}</span>
          </div>
          {item.propertiesSold !== undefined && (
            <div className="agent-detail-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                  stroke="#6b7280"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 22V12H15V22"
                  stroke="#6b7280"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{item.propertiesSold} properties sold</span>
            </div>
          )}
        </div>
        <button className="contact-agent-btn">Contact Agent</button>
      </div>
    </div>
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="latest-updates-section">
      <div className="landing-container">
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          <p className="section-subtitle">{description}</p>
        </div>

        <div className="carousel-wrapper" ref={wrapperRef}>
          <div className="carousel-container" ref={carouselRef}>
            {items.map((item) => (renderCard ? renderCard(item) : renderDefaultCard(item)))}
          </div>
        </div>

        <div className="carousel-controls">
          <button
            className="carousel-arrow prev"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            aria-label="Previous slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="carousel-dots">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${currentSlide === index ? "active" : ""}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            className="carousel-arrow next"
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            aria-label="Next slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
