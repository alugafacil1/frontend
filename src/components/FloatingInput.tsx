import React from 'react';

interface Option {
  label: string;
  value: string | number;
}

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label: string;
  options?: Option[];
  icon?: React.ReactNode; 
}

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
    style={{ width: '20px', height: '20px' }}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

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
              placeholder={props.placeholder || ""} 
            />
            {/* Renderiza ícone à direita se existir (ex: Bandeira) */}
            {icon && <div className="input-floating-icon">{icon}</div>}
          </>
        )}
      </div>
    </div>
  );
};