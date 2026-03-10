"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { translateRole } from "@/utils/translateRoles";

interface UserMenuProps {
  user: any;
  logout: () => void;
}

export function UserMenu({ user, logout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };
  console.log("user: ", user);
  return (
    <div className="user-menu" ref={dropdownRef}>
      <button className="avatar-btn" onClick={() => setIsOpen(!isOpen)}>
        {user?.photoUrl ? (
          <img src={`${apiBaseUrl}${user.photoUrl}`} alt="Perfil" />
        ) : (
          <div className="avatar-placeholder">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
            <small style={{ color: 'var(--primary-blue)', display: 'block', marginTop: '4px' }}>
              {translateRole(user?.role)}
            </small>
          </div>
          <Link href="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>Visualizar Perfil</Link>
          <Link href="/preferences" className="dropdown-item" onClick={() => setIsOpen(false)}>Preferências</Link>
          <button onClick={handleLogout} className="dropdown-item logout">Sair</button>
        </div>
      )}
    </div>
  );
}