import React from 'react';
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface Option {
  label: string;
  value: string | number;
}

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label: string;
  options?: Option[];
  icon?: React.ReactNode; 
}

export const FloatingInput = ({ label, options, icon, ...props }: FloatingInputProps) => {
  const isSelect = Boolean(options && options.length > 0);

  return (
    <div className="floating-input-container">
      
      <label className="floating-label">
        {label}
      </label>

      <div className="relative w-full">
        {isSelect ? (
          <>
            <select
              {...(props as any)}
              className="custom-select"
            >
              {/* Opção vazia para servir como placeholder no Select */}
              <option value="" disabled hidden>
                {props.placeholder || `Selecione...`}
              </option>
              {options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            
            <ChevronDownIcon className="select-icon" />
          </>
        ) : (
          <>
            <input
              {...props}
              className="custom-input"
              // Placeholder cinza suave como no print
              placeholder={props.placeholder || `Digite ${label.toLowerCase()}`} 
            />
            {/* Renderiza ícone à direita se existir (ex: Bandeira) */}
            {icon && <div className="input-floating-icon">{icon}</div>}
          </>
        )}
      </div>
    </div>
  );
};