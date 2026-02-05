interface AmenityToggleProps {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}

export const AmenityToggle = ({ label, checked, onChange }: AmenityToggleProps) => (
  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50">
    <span className="font-medium text-gray-700">{label}</span>
    <button
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full transition-colors relative ${checked ? 'bg-purple-600' : 'bg-gray-300'}`}
    >
      <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-6' : ''}`} />
    </button>
  </div>
);