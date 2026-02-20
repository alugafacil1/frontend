"use client";

import { FloatingInput } from "../FloatingInput";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { useMasks } from "../../../hooks/useMasks.ts"

interface RentStepProps {
  data: any;
  updateData: (newData: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export const RentStep = ({ data, updateData, onNext, onBack }: RentStepProps) => {
  const { maskCurrency, maskNumber } = useMasks();

  // Função genérica para aplicar máscara de moeda e atualizar
  const handleCurrencyChange = (field: string, value: string) => {
    const maskedValue = maskCurrency(value);
    updateData({ [field]: maskedValue });
  };

  // Função para números inteiros
  const handleNumberChange = (field: string, value: string) => {
    const maskedValue = maskNumber(value);
    updateData({ [field]: maskedValue });
  };

  // Validação: Verifica se os campos obrigatórios estão preenchidos
  const isValid = data.monthlyRent && data.moveInDate;

  return (
    <div className="step-container">
      <h2 className="step-inner-title">Detalhes do Aluguel</h2>

      <div className="rent-grid">
        {/* --- LINHA 1 --- */}
        <FloatingInput 
          label="Aluguel Mensal" 
          placeholder="R$ 0,00"
          value={data.monthlyRent}
          onChange={(e) => handleCurrencyChange("monthlyRent", e.target.value)}
        />

        <FloatingInput 
          label="Tempo Mínimo (Meses)" 
          placeholder="Ex: 12"
          type="tel" // 'tel' abre teclado numérico no mobile
          value={data.minTenancy}
          onChange={(e) => handleNumberChange("minTenancy", e.target.value)}
        />
        
        {/* --- LINHA 2 --- */}
        <FloatingInput 
          label="Aluguel Semanal (Opcional)" 
          placeholder="R$ 0,00"
          value={data.weeklyRent}
          onChange={(e) => handleCurrencyChange("weeklyRent", e.target.value)}
        />

        <FloatingInput 
          label="Valor da Caução (Depósito)" 
          placeholder="R$ 0,00"
          value={data.deposit}
          onChange={(e) => handleCurrencyChange("deposit", e.target.value)}
        />

        {/* --- LINHA 3 --- */}
        <div className="input-with-icon-wrapper">
          <FloatingInput 
            label="Disponível a partir de" 
            placeholder="Selecione a data"
            type="date"
            value={data.moveInDate}
            onChange={(e) => updateData({ moveInDate: e.target.value })}
          />
          {/* Ícone posicionado via CSS */}
          <CalendarDaysIcon 
            className="w-6 h-6 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" 
          />
        </div>

        <FloatingInput 
          label="Nº Máximo de Ocupantes" 
          placeholder="Ex: 2"
          type="tel"
          value={data.maxAttendants}
          onChange={(e) => handleNumberChange("maxAttendants", e.target.value)}
        />
      </div>

      {/* Botões */}
      <div className="buttons-container">
        <button onClick={onBack} className="btn-back">
          Voltar
        </button>
        
        <button 
          onClick={onNext}
          className="btn-next"
          disabled={!isValid}
        >
          Próximo
        </button>
      </div>
    </div>
  );
};