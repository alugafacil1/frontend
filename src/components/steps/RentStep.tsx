"use client";

import { FloatingInput } from "../FloatingInput";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

interface RentStepProps {
  data: any;
  updateData: (newData: any) => void;
  onNext: () => void;
  onBack: () => void; 
}

export const RentStep = ({ data, updateData, onNext, onBack }: RentStepProps) => {
  
  // Validação simples: Aluguel e Data são obrigatórios
  const isValid = data.monthlyRent && data.moveInDate;

  return (
    <div className="step-container">
      <h2 className="step-inner-title">
        Detalhes do Imóvel/Quarto
      </h2>
      
      {/* Grid de Inputs organizado conforme a imagem */}
      <div className="rent-grid">
        
        {/* Linha 1 */}
        <FloatingInput 
          label="Aluguel Mensal" 
          placeholder="Digite o valor"
          value={data.monthlyRent}
          onChange={(e) => updateData({ monthlyRent: e.target.value })}
        />

        <FloatingInput 
          label="Tempo Mínimo de Contrato" 
          placeholder="Digite"
          type="number"
          value={data.minTenancy}
          onChange={(e) => updateData({ minTenancy: e.target.value })}
        />
        
        {/* Linha 2 */}
        <FloatingInput 
          label="Aluguel Semanal" 
          placeholder="Digite o valor"
          value={data.weeklyRent}
          onChange={(e) => updateData({ weeklyRent: e.target.value })}
        />

        <FloatingInput 
          label="Valor da Caução" 
          placeholder="Digite o valor"
          value={data.deposit}
          onChange={(e) => updateData({ deposit: e.target.value })}
        />

        {/* Linha 3 */}
        <div className="input-with-icon-wrapper">
          <FloatingInput 
            label="Disponível a partir de" 
            placeholder="Selecione a data"
            type="date"
            value={data.moveInDate}
            onChange={(e) => updateData({ moveInDate: e.target.value })}
          />
          <CalendarDaysIcon className="input-floating-icon" />
        </div>

        <FloatingInput 
          label="Nº Máximo de Ocupantes" 
          placeholder="Digite"
          type="number"
          value={data.maxAttendants}
          onChange={(e) => updateData({ maxAttendants: e.target.value })}
        />
      </div>

      {/* Botões de Navegação */}
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