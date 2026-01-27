"use client";

import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="cta-section">
      <div className="cta-background">
        {/* Decorative shapes */}
        <div className="cta-shape cta-shape-1"></div>
        <div className="cta-shape cta-shape-2"></div>
        <div className="cta-shape cta-shape-3"></div>
      </div>
      <div className="landing-container">
        <div className="cta-content">
          <p className="cta-subtitle">Register or Login</p>
          <h2 className="cta-title">Ready to Get Started?</h2>
          <div className="cta-buttons">
            <Link href="/signUp" className="cta-btn cta-btn-register">
              Register
            </Link>
            <Link href="/login" className="cta-btn cta-btn-login">
              Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
