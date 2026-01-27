"use client";

import Link from "next/link";

interface HeaderProps {
  transparent?: boolean;
}

export default function Header({ transparent = false }: HeaderProps) {
  return (
    <header className={`landing-header ${transparent ? "transparent" : ""}`}>
      <div className="landing-container">
        <div className="header-content">
          <Link href="/" className="logo">
            <img src="/logo.svg" alt="AlugaFácil" />
          </Link>
          <div className="auth-buttons">
            <Link href="/login" className="btn-login">
              Login
            </Link>
            <Link href="/signUp" className="btn-register">
              Cadastrar-se
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
