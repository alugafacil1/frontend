"use client";

import { useState } from "react";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    id: 1,
    question: "Como começo a procurar um imóvel no AlugaFácil?",
    answer:
      "É muito simples! Use nossa barra de busca e os filtros avançados para escolher a localização, o tipo de imóvel (casa, apartamento ou studio) e a faixa de preço. Quando encontrar o imóvel ideal, basta visualizar os detalhes e entrar em contato direto com o anunciante.",
  },
  {
    id: 2,
    question: "Quem pode anunciar imóveis na plataforma?",
    answer:
      "O AlugaFácil foi desenhado para atender todo o mercado imobiliário. Aceitamos anúncios de Imobiliárias (que podem cadastrar toda a sua equipe de corretores), Corretores independentes e também de Proprietários pessoa física que desejam negociar seus próprios imóveis.",
  },
  {
    id: 3,
    question: "É seguro negociar pelos anúncios da plataforma?",
    answer:
      "Sim, a segurança é a nossa prioridade. Todos os nossos usuários (sejam eles inquilinos, proprietários ou imobiliárias) passam por um processo de cadastro estruturado. Além disso, nós facilitamos a comunicação direta e transparente entre as partes.",
  },
  {
    id: 4,
    question: "Quais tipos de imóveis eu encontro por aqui?",
    answer:
      "Nossa plataforma é focada em versatilidade residencial e comercial. Você encontrará desde studios práticos e apartamentos bem localizados até casas espaçosas, gerenciados tanto por imobiliárias profissionais quanto direto com os donos.",
  },
  {
    id: 5,
    question: "Como faço para agendar uma visita ao imóvel?",
    answer:
      "Sem burocracia! Na página do imóvel que você gostou, haverá um botão indicando 'Falar com o Corretor' ou 'Falar com o Proprietário'. Clicando ali, você inicia o contato diretamente com o responsável para alinhar o melhor dia e horário da sua visita.",
  },
];

export default function FAQ() {
  const [openItem, setOpenItem] = useState<number | null>(1);

  const toggleItem = (id: number) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <section className="faq-section">
      <div className="landing-container">
        <div className="faq-content">
          {/* Lado Direito - Cabeçalho */}
          <div className="faq-header">
            <div className="faq-label">
              <span className="faq-dot">•</span>
              <span>Dúvidas Frequentes</span>
            </div>
            <h2 className="faq-title">Perguntas Frequentes</h2>
            <p className="faq-description">
              Tem alguma dúvida sobre como alugar, comprar ou anunciar no AlugaFácil? 
              Reunimos as principais respostas para te ajudar em cada etapa do processo.
            </p>
          </div>

          {/* Lado Esquerdo - Itens do FAQ */}
          <div className="faq-items">
            {faqItems.map((item) => (
              <div key={item.id} className={`faq-item ${openItem === item.id ? "open" : ""}`}>
                <button className="faq-question" onClick={() => toggleItem(item.id)}>
                  <span>{item.question}</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`faq-chevron ${openItem === item.id ? "open" : ""}`}
                  >
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {openItem === item.id && (
                  <div className="faq-answer">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}