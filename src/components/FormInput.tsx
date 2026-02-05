import { InputHTMLAttributes, ReactNode } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode; // Adicionamos o ícone como opcional
}

export const FormInput = ({ label, icon, ...props }: FormInputProps) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-medium text-zinc-700 ml-1">
        {label}
      </label>
      
      <div className="relative flex items-center group">
        {/* Renderiza o ícone se ele existir */}
        {icon && (
          <div className="absolute left-3 transition-colors group-focus-within:text-purple-600">
            {icon}
          </div>
        )}
        
        <input
          {...props}
          className={`
            w-full bg-white border border-zinc-200 rounded-lg py-2.5 text-zinc-900 
            placeholder:text-zinc-400 outline-none transition-all
            focus:border-purple-600 focus:ring-4 focus:ring-purple-50
            ${icon ? 'pl-10' : 'pl-4'} // Ajusta o padding se houver ícone
            pr-4
          `}
        />
      </div>
    </div>
  );
};