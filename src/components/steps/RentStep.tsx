"use client";

import { FloatingInput } from "../FloatingInput";
import { CalendarIcon } from "@heroicons/react/24/outline";

interface RentStepProps {
  data: any;
  updateData: (newData: any) => void;
  onNext: () => void;
}

export const RentStep = ({ data, updateData, onNext }: RentStepProps) => {
  return (
    <div className="step-container">
      {/* Título da Seção */}
      <h2 className="step-inner-title">
        Property/ Room Details
      </h2>

      {/* Grid de Inputs de Valores e Prazos */}
      <div className="rent-grid">
        <FloatingInput 
          label="Monthly Rent" 
          placeholder="Enter amount"
          value={data.monthlyRent}
          onChange={(e) => updateData({ monthlyRent: e.target.value })}
        />
        
        <FloatingInput 
          label="Minimum Tenancy Length" 
          placeholder="Enter"
          value={data.minTenancy}
          onChange={(e) => updateData({ minTenancy: e.target.value })}
        />

        <FloatingInput 
          label="Weekly Rent" 
          placeholder="Enter amount"
          value={data.weeklyRent}
          onChange={(e) => updateData({ weeklyRent: e.target.value })}
        />

        <FloatingInput 
          label="Deposit Amount" 
          placeholder="Enter amount"
          value={data.deposit}
          onChange={(e) => updateData({ deposit: e.target.value })}
        />

        <div className="input-with-icon">
          <FloatingInput 
            label="Earliest Move in Date" 
            placeholder="Enter date"
            type="text"
            value={data.moveInDate}
            onChange={(e) => updateData({ moveInDate: e.target.value })}
          />
          <CalendarIcon className="calendar-icon" />
        </div>

        <FloatingInput 
          label="Maximum no of Attendants" 
          placeholder="Enter"
          value={data.maxAttendants}
          onChange={(e) => updateData({ maxAttendants: e.target.value })}
        />
      </div>

      {/* Botão Next idêntico à imagem */}
      <div className="button-wrapper">
        <button 
          onClick={onNext}
          className="btn-next"
        >
          Next
        </button>
      </div>
    </div>
  );
};