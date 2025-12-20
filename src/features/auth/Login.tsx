"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import Button from "@/components/button";
import Link from "next/link";

export default function Login() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await login(email, password);
  }

   return (
    <div className="login-page">
      <div className="login-container">

        <div className="login-left">
          <div className="login-logo">
            <img src="/logo.svg" alt="AlugaFácil"></img>
          </div>

          <h1 className="login-title">Login</h1>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder=" "
              />
              <label htmlFor="email">Email</label>
            </div>

            <div className="form-group password">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder=" "
              />
              <label htmlFor="password">Senha</label>

              <button
                type="button"
                className="toggle-password"
                aria-label="Mostrar senha"
                onClick={() => setShowPassword(!showPassword)}
              >
                <img
                  src={
                    showPassword
                      ? "/icons/eye-on.svg"
                      : "/icons/eye-off.svg"
                  }
                  alt="Mostrar senha"
                />
              </button>
            </div>

            <div className="login-options">
              <label>
                <input type="checkbox" /> Lembrar me
              </label>
              <a href="#" className="forgot link-color">Esqueceu a senha?</a>
            </div>

            <Button
              type="submit"
              loading={loading}
              loadingText="Entrando..."
              className="w-full login-button"
            >
              Login
            </Button>

            <p className="login-signup">
              Não tem uma conta? <Link href="/signUp" className="link-color">Cadastrar</Link>
            </p>

            <div className="login-divider">
              <span>Ou faça login com</span>
            </div>

            <div className="login-social">
              <button className="social-btn">
                <img src="/icons/facebook.svg" alt="Facebook" />
              </button>
              <button className="social-btn">
                <img src="/icons/google.svg" alt="Google" />
              </button>
              <button className="social-btn">
                <img src="/icons/apple.svg" alt="Apple" />
              </button>
            </div>
          </form>
        </div>

        <div className="login-right">
        <div className="login-illustration-card">
          <img src="/login-illustration.png" alt="Login" />
          <div className="login-slider">
            <span className="active" />
            <span />
            <span />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
