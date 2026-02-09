"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/useAuth";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import "@/assets/styles/header/index.css";

interface HeaderProps {
  transparent?: boolean;
}

const ROLES_ADMINISTRATIVAS = ["REALTOR", "OWNER", "ADMIN"];

export default function Header({ transparent = false }: HeaderProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const canAccessManagement = user?.role && ROLES_ADMINISTRATIVAS.includes(user.role);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    router.push("/login");
  };

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
                <Link href="/imoveis" className="nav-link">Imóveis</Link>
                
                {canAccessManagement && (
                  <Link href="/management" className="nav-link">
                    Gerenciamento
                  </Link>
                )}
                
                <Link href="/dashboard" className="nav-link">Dashboard</Link>
              </nav>

              <div className="header-actions">
                <button className="btn-post-ad">Post an AD</button>
                <button className="icon-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </button>
                <button className="icon-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                </button>

                <div className="user-menu" ref={dropdownRef}>
                  <button 
                    className="avatar-btn" 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    {user?.photoUrl ? (
                      <img src={user.photoUrl} alt="Perfil" />
                    ) : (
                      <div className="avatar-placeholder">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                  </button>

                  {isDropdownOpen && (
                    <div className="dropdown-menu">
                      <div className="dropdown-header">
                        <strong>{user?.name}</strong>
                        <span>{user?.email}</span>
                        <small style={{ color: 'var(--primary-blue)', display: 'block', marginTop: '4px' }}>
                           {user?.role}
                        </small>
                      </div>
                      <Link 
                        href="/profile" 
                        className="dropdown-item"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Visualizar Perfil
                      </Link>
                      <button onClick={handleLogout} className="dropdown-item logout">
                        Sair
                      </button>
                    </div>
                  )}
                </div>
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