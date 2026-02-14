"use client";
import React from 'react';

interface HouseRulesStepProps {
  data: any;
  updateData: (newData: any) => void;
  onNext: () => void;
  onBack: () => void;
}


const EXTRA_ITEMS_LIST = [
  "Vaga de Garagem",
  "Aceita Animais",
  "Aceita Fumantes",
  "Sacada / Varanda",
  "Mobiliado",
  "Ar-condicionado",
  "Churrasqueira",
  "Elevador",
  "Portaria / Segurança"
];

export const HouseRulesStep = ({ data, updateData, onNext, onBack }: HouseRulesStepProps) => {
  
  // Usamos 'houseRules' para armazenar esses dados extras
  const selectedRules = data.houseRules || [];

  const toggleRule = (rule: string) => {
    let newRules;
    if (selectedRules.includes(rule)) {
      newRules = selectedRules.filter((r: string) => r !== rule);
    } else {
      newRules = [...selectedRules, rule];
    }
    updateData({ houseRules: newRules });
  };

  return (
    <div className="step-container">
      <h2 className="step-inner-title">Detalhes do Imóvel/Quarto</h2>
      <p className="step-description">
        Marque o que o imóvel oferece
      </p>

      
      <div className="rules-list-columns">
        {EXTRA_ITEMS_LIST.map((item) => {
          const isSelected = selectedRules.includes(item);
          
          return (
            <div 
              key={item} 
              className={`rule-row ${isSelected ? 'selected' : ''}`}
              onClick={() => toggleRule(item)}
            >
              <span className="rule-name">
                {item}
              </span>

              
              <div className={`toggle-switch ${isSelected ? 'active' : ''}`}>
                <div className="toggle-thumb"></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="buttons-container">
        <button onClick={onBack} className="btn-back">
          Voltar
        </button>
        
        <button onClick={onNext} className="btn-next">
          Próximo
        </button>
      </div>
    </div>
  );
};