import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  isSelect?: boolean; 
}

export const FloatingInput = ({ label, isSelect, ...props }: FloatingInputProps) => {
  return (
    <div className="relative w-full">
      
      <input
        {...props}
        className="peer w-full h-[50px] px-4 pt-1 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-transparent focus:outline-none focus:border-black transition-colors"
        placeholder={label} 
      />
      
      
      <label className="absolute -top-2.5 left-3 bg-white px-1 text-sm text-gray-600 font-medium transition-all peer-placeholder-shown:text-gray-400 peer-focus:text-black">
        {label}
      </label>

      
      {isSelect && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        </div>
      )}
    </div>
  );
};