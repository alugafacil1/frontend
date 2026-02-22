import { useCallback } from "react";

export function useMasks() {
  
  // --- MÁSCARAS PARA INPUTS (Enquanto o usuário digita) ---

  const maskCurrency = useCallback((value: string | number) => {
    if (!value) return "";
    
    // Remove tudo que não é dígito
    const onlyDigits = String(value).replace(/\D/g, "");
    
    // Evita divisão por zero ou valores vazios
    if (onlyDigits === "") return "";

    // Divide por 100 para considerar os centavos
    const numberValue = Number(onlyDigits) / 100;

    return numberValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }, []);

  const maskNumber = useCallback((value: string) => {
    return value.replace(/\D/g, "");
  }, []);

  const maskCep = useCallback((value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{5})(\d)/, "$1-$2")
      .slice(0, 9);
  }, []);

  // --- FORMATAÇÃO PARA EXIBIÇÃO (Leitura/Preview) ---

  const formatCurrency = useCallback((value: string | number) => {
    if (value === undefined || value === null || value === "") return "R$ 0,00";
    
    // Se já vier formatado (string com R$), retorna como está
    if (typeof value === 'string' && value.includes('R$')) return value;

    // Se for número ou string numérica, formata
    return Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }, []);

  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return "-";
    
    const parts = dateString.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  }, []);

  const formatBool = useCallback((value: any) => {
    return value ? "Sim" : "Não";
  }, []);

  const translateType = useCallback((type: string) => {
    const map: Record<string, string> = {
      APARTMENT: "Apartamento",
      HOUSE: "Casa",
      COMMERCIAL: "Ponto Comercial",
      
      apartment: "Apartamento",
      house: "Casa",
      studio: "Studio",
      room_single: "Quarto Individual",
      room_shared: "Quarto Compartilhado",
      dorm: "República"
    };
    return map[type] || type || "-";
  }, []);

  // --- UTILS (Para limpar dados antes de enviar ao Backend) ---

  const unmaskCurrency = useCallback((value: string): number => {
    if (typeof value === "number") return value;
    const onlyDigits = value.replace(/\D/g, "");
    return onlyDigits ? Number(onlyDigits) / 100 : 0; 
  }, []);

  const unmaskNumber = useCallback((value: string): number => {
    const onlyDigits = value.replace(/\D/g, "");
    return onlyDigits ? Number(onlyDigits) : 0;
  }, []);

  return {
    
    maskCurrency,
    maskNumber,
    maskCep,
    
    formatCurrency,
    formatDate,
    formatBool,
    translateType,
    
    unmaskCurrency,
    unmaskNumber
  };
}