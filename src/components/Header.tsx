"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/useAuth";
import { NotificationBell } from "./NotificationBell"; // Ajuste o caminho se necessário
import { UserMenu } from "./UserMenu";                 // Ajuste o caminho se necessário
import "@/assets/styles/header/index.css";

interface HeaderProps {
  transparent?: boolean;
}

const ROLES_ADMINISTRATIVAS = ["REALTOR", "OWNER", "ADMIN", "AGENCY_ADMIN"];
const ROLES = ["REALTOR", "OWNER", "ADMIN", "AGENCY_ADMIN", "TENANT"];
const ROLES_DASHBOARD = ["OWNER", "ADMIN", "AGENCY_ADMIN"];

export default function Header({ transparent = false }: HeaderProps) {
  const { user, logout, isAuthenticated } = useAuth();

  const canAccessManagement = user?.role && ROLES_ADMINISTRATIVAS.includes(user.role);

  const canAccessDashboard = user?.role && ROLES_DASHBOARD.includes(user.role);
  const canPostAd = user?.role === 'OWNER' || user?.role === 'REALTOR';
  const seeChats = user?.role && ROLES.includes(user.role);
  return (
    <header className={`landing-header ${transparent ? "transparent" : ""}`}>
      <div className="landing-container">
        <div className="header-content">
          <Link href="/" className="logo">
            <img src="/logo.svg" alt="AlugaFácil" />
          </Link>

          {isAuthenticated ? (
            <>
              <nav className="header-nav">
                <Link href="/" className="nav-link">Home</Link>
                <Link href="/ads/my-properties" className="nav-link">Imóveis</Link>
                {canAccessManagement && (
                  <Link href="/management" className="nav-link">Gerenciamento</Link>
                )}
                {canAccessDashboard && (
                  <Link href="/dashboard" className="nav-link">Dashboard</Link>
                )}
                {seeChats && (
                  <Link href="/chat" className="nav-link">Chats</Link>
                )}
              </nav>

              <div className="header-actions">
                {canPostAd && (
                  <Link href="/ads/create" className="btn-post-ad">
                    Publicar Anúncio
                  </Link>
                )}
                
                {/* Componentes Abstraídos */}
                <NotificationBell isAuthenticated={isAuthenticated} />
                <UserMenu user={user} logout={logout} />
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link href="/login" className="btn-login">Login</Link>
              <Link href="/signUp" className="btn-register">Cadastrar-se</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}