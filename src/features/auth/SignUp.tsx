"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import Button from "@/components/button";

export default function SignUp() {
  const { signup, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [cpf, setCpf] = useState("");
  const [type, settype] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signup(name, email, phone, cpf, type, password);
  }

  function maskPhone(value: string) {
    const numbers = value.replace(/\D/g, "");

    if (numbers.length <= 10) {
      return numbers
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }

    return numbers
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  }

  function maskCPF(value: string) {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14);
  }
   return (
    <div className="signUp-page">
      <div className="signUp-container">

        <div className="signUp-right">
          <div className="signUp-logo">
            <img src="/logo.svg" alt="AlugaFácil"></img>
          </div>

          <h1 className="signUp-title">Cadastro</h1>

          <form onSubmit={handleSubmit} className="signUp-form">
            <div className="form-group">
                <input
                    type="text"
                    id="name"
                    required
                    placeholder=" "
                />
                <label htmlFor="name">Nome</label>
                
            </div>
            <div className="signUp-grid">
                
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
                <div className="form-group">
                <input
                    type="text"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(maskPhone(e.target.value))}
                    required
                    placeholder=" "
                />
                <label htmlFor="phone">Telefone</label>
                
                </div>
            </div>

            <div className="signUp-grid">
              <div className="form-group">
                <input
                  type="text"
                  id="cpf"
                  value={cpf}
                  onChange={(e) => setCpf(maskCPF(e.target.value))}
                  required
                  placeholder=" "
                  maxLength={14}
                />
                <label htmlFor="cpf">CPF</label>
              </div>

              <div className="form-group">
                <select
                  id="documentType"
                  value={type}
                  onChange={(e) => settype(e.target.value)}
                  required
                >
                  <option value="" disabled>Selecione o tipo</option>
                  <option value="anunciante">Anunciante</option>
                  <option value="locatario">Locatário</option>
                </select>
                <label htmlFor="type">Tipo de cadastro</label>
              </div>
            </div>

            <div className="form-group">
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

            <div className="form-group password">
              <input
                type={showPasswordConfirm ? "text" : "password"}
                id="passwordConfirm"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                placeholder=" "
              />
              <label htmlFor="passwordConfirm">Confirmar Senha</label>

              <button
                type="button"
                className="toggle-password"
                aria-label="Mostrar senha"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              >
                <img
                  src={
                    showPasswordConfirm
                      ? "/icons/eye-on.svg"
                      : "/icons/eye-off.svg"
                  }
                  alt="Mostrar senha"
                />
              </button>
            </div>

            <div className="signUp-options">
              <label>
                <input type="checkbox" /> Eu concordo com todos os termos e políticas
              </label>
            </div>

            <Button
              type="submit"
              loading={loading}
              loadingText="Criando..."
              className="w-full signUp-button"
            >
              Criar Conta
            </Button>

            <p className="signUp-signup">
              Já tem uma conta? <a href="#" className="link-color">Entrar</a>
            </p>

            <div className="signUp-divider">
              <span>Ou cadastre com</span>
            </div>

            <div className="signUp-social">
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

        <div className="signUp-left">
        <div className="signUp-illustration-card">
          <img src="/signup-illustration.png" alt="signUp" />
          <div className="signUp-slider">
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
