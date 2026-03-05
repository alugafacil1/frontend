"use client";

import { FloatingInput } from "../FloatingInput";
import { useLocation } from "@/../hooks/useLocation"; 
import { useCep } from "@/../hooks/useCep";           

interface DetailsStepProps {
  data: any;
  updateData: (newData: any) => void;
  onNext: () => void;
}

const TIPOS_IMOVEL = [
  { label: "Apartamento", value: "APARTMENT" },
  { label: "Casa", value: "HOUSE" },
  { label: "Ponto Comercial", value: "COMMERCIAL" }
];

export const DetailsStep = ({ data, updateData, onNext }: DetailsStepProps) => {
  // 1. Hook de Localização
  const { countries, cities, loadingCities } = useLocation(data.country);
  
  // 2. Hook de CEP
  const { maskCep, fetchAddress } = useCep();

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = maskCep(e.target.value);
    updateData({ postalCode: maskedValue });

    // Se CEP estiver completo, busca endereço
    if (maskedValue.length === 9) {
      // Garante que o país seja Brasil para a busca fazer sentido
      if (!data.country) updateData({ country: "Brazil" });

      const addressData = await fetchAddress(maskedValue);
      
      if (addressData) {
        updateData({
          postalCode: maskedValue,
          address: addressData.address,
          city: addressData.city,
          country: "Brazil" 
        });
      }
    }
  };

  return (
    <div className="step-container">
      <h2 className="step-inner-title">Detalhes do Imóvel</h2>

      <div className="details-grid">
        <FloatingInput 
          label="Selecione o País" 
          type="select" 
          options={countries}
          value={data.country}
          onChange={(e) => updateData({ country: e.target.value, city: "" })}
          placeholder="Selecione..."
        />
        
        <FloatingInput 
          label={loadingCities ? "Carregando..." : "Selecione a Cidade"}
          type={cities.length > 0 ? "select" : "text"} 
          options={cities}
          value={data.city}
          disabled={!data.country || loadingCities}
          placeholder="Selecione a cidade"
          onChange={(e) => updateData({ city: e.target.value })}
        />

        <FloatingInput 
          label="CEP" 
          placeholder="00000-000"
          value={data.postalCode}
          onChange={handleCepChange}
          maxLength={9}
        />
        
        <FloatingInput 
          label="Tipo de Imóvel" 
          type="select"
          options={TIPOS_IMOVEL}
          value={data.propertyType}
          onChange={(e) => updateData({ propertyType: e.target.value })}
        />

        <FloatingInput 
          label="Número" 
          placeholder="Ex: 123"
          value={data.number}
          onChange={(e) => updateData({ number: e.target.value })}
        />
        
        <FloatingInput 
          label="Endereço (Rua/Av)" 
          value={data.address}
          onChange={(e) => updateData({ address: e.target.value })}
        />

        <FloatingInput 
          label="Quartos" 
          type="number"
          min="0"
          value={data.rooms}
          onChange={(e) => updateData({ rooms: e.target.value })}
        />
        
        <FloatingInput 
          label="Banheiros" 
          type="number"
          min="0"
          value={data.bathrooms}
          onChange={(e) => updateData({ bathrooms: e.target.value })}
        />
      </div>

      <button onClick={onNext} className="btn-primary-full">
        Próximo
      </button>
    </div>
  );
};