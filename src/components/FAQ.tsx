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
    question: "How do I start searching for a property with Urbanouse?",
    answer:
      "You can begin by using our property search tool, which allows you to filter by location, property type, price range, and other features. Once you find a property you're interested in, simply click 'View Details' to learn more or schedule a visit.",
  },
  {
    id: 2,
    question: "What services does Urbanouse offer for first-time homebuyers?",
    answer:
      "Urbanouse offers comprehensive services for first-time homebuyers including property search assistance, financing guidance, legal support, and step-by-step guidance through the entire purchasing process.",
  },
  {
    id: 3,
    question: "Can Urbanouse help me sell my property?",
    answer:
      "Yes, Urbanouse provides full-service property selling assistance including property valuation, marketing, staging advice, and negotiation support to help you get the best price for your property.",
  },
  {
    id: 4,
    question: "What types of properties does Urbanouse specialize in?",
    answer:
      "Urbanouse specializes in a wide range of properties including residential homes, apartments, commercial spaces, and rental properties. We work with properties of all sizes and price ranges.",
  },
  {
    id: 5,
    question: "Can I schedule a visit to view properties?",
    answer:
      "Absolutely! You can schedule property viewings directly through our platform. Simply select a property you're interested in and choose an available time slot that works for you.",
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
          {/* Right side - Header */}
          <div className="faq-header">
            <div className="faq-label">
              <span className="faq-dot">•</span>
              <span>FAQ's</span>
            </div>
            <h2 className="faq-title">Frequently Asked Questions</h2>
            <p className="faq-description">
              Have questions about buying, selling, or renting with Urbanouse? We've got the answers to help guide you
              through the process.
            </p>
          </div>

          {/* Left side - FAQ Items */}
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
