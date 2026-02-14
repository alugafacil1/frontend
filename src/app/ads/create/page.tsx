"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Ícones atualizados para corresponder ao design (Versão Solid/Circle)
import { UserCircleIcon, DocumentTextIcon, CheckCircleIcon } from "@heroicons/react/24/solid";

// Hooks de Autenticação
import { useAuth } from "@/lib/auth/useAuth";

// Serviço de API
import { propertyService } from "@/services/property/propertyService";

// CSS Global Ajustado
import "@/assets/styles/ads/CreateAd.css"; 

// Componentes dos Passos
import { DetailsStep } from "@/components/steps/DetailsStep";
import { RentStep } from "@/components/steps/RentStep"; 
import { AmenitiesStep } from "@/components/steps/AmenitiesStep"; 
import { HouseRulesStep } from "@/components/steps/HouseRulesStep"; 
import { DescriptionStep } from "@/components/steps/DescriptionStep"; 
import { MediaStep } from "@/components/steps/MediaStep"; 
import { PreviewStep } from "@/components/steps/PreviewStep"; 
import { SuccessModal } from "@/components/SuccessModal";

// Interface do Form (Estado Local)
interface FormData {
  // Step 1 - Details
  country: string; 
  city: string; 
  postalCode: string; 
  propertyType: string;
  number: string; 
  address: string; 
  rooms: string; 
  bathrooms: string;
  contactPhone: string;
  
  // Step 2 - Rent
  monthlyRent: string; 
  weeklyRent: string; 
  minTenancy: string;
  deposit: string; 
  moveInDate: string; 
  maxAttendants: string;
  
  // Step 3 & 4 - Amenities & Rules
  amenities: string[]; 
  houseRules: string[];
  
  // Step 5 - Description
  title: string; 
  description: string; 
  
  // Step 6 - Media
  images: File[]; 
  videoLink: string;
}

export default function CreateAdPage() {
  const router = useRouter();
  const { user } = useAuth(); // Pegando o usuário logado
  
  const [step, setStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado inicial completo
  const [formData, setFormData] = useState<FormData>({
    country: '', city: '', postalCode: '', propertyType: '',
    number: '', address: '', rooms: '', bathrooms: '',
    contactPhone: '', 
    monthlyRent: '', weeklyRent: '', minTenancy: '',
    deposit: '', moveInDate: '', maxAttendants: '',
    amenities: [], houseRules: [],
    title: '', description: '', images: [], videoLink: ''
  });

  const updateData = (newData: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  // --- NAVEGAÇÃO ENTRE PASSOS ---
  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  // --- ENVIO PARA O BACKEND ---
  const handleFinish = async () => {
    if (!user || !user.id) {
      alert("Erro: Usuário não identificado. Faça login novamente.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. Limpeza e Conversão de Preço (De "1.500,00" para 150000 centavos)
      // Remove tudo que não for dígito ou vírgula, troca vírgula por ponto
      const cleanPriceString = formData.monthlyRent.replace(/[^\d,]/g, '').replace(',', '.');
      const priceFloat = parseFloat(cleanPriceString) || 0;
      const priceInCents = Math.round(priceFloat * 100);

      // 2. Mapeamento dos Booleanos
      const hasAmenity = (keyword: string) => 
        formData.amenities.some(a => a.toLowerCase().includes(keyword.toLowerCase()));
      
      const hasRule = (keyword: string) => 
        formData.houseRules.some(r => r.toLowerCase().includes(keyword.toLowerCase()));

      // 3. Montagem do Payload (DTO PropertyRequest)
      const payload = {
        title: formData.title || "Imóvel sem título",
        description: formData.description || "Sem descrição",
        
        address: {
          street: formData.address,
          number: formData.number,
          city: formData.city,
          state: formData.country === 'br' ? 'Brasil' : formData.country, 
          postalCode: formData.postalCode,
          neighborhood: "Centro" // TODO: Adicionar campo de bairro no form se necessário
        },
        
        geolocation: {
          latitude: 0.0, // Mock, pois não temos mapa ainda
          longitude: 0.0
        },

        priceInCents: priceInCents,
        
        numberOfRooms: parseInt(formData.rooms) || 0,
        numberOfBedrooms: parseInt(formData.rooms) || 0, 
        numberOfBathrooms: parseInt(formData.bathrooms) || 0,
        
        furnished: hasAmenity('Furnished') || hasAmenity('Mobiliado'),
        petFriendly: hasRule('Pets Allowed') || hasRule('Animais permitidos'),
        garage: hasAmenity('Garage') || hasAmenity('Parking') || hasAmenity('Estacionamento'),
        
        isOwner: true,
        
        videoUrl: formData.videoLink || "",
        phoneNumber: formData.contactPhone || "0000000000",
        
        photoUrls: [], // Enviamos vazio, pois as fotos vão em outra rota
        status: "ACTIVE", 
        type: formData.propertyType ? formData.propertyType.toUpperCase() : "APARTMENT",
        
        userId: user.id 
      };

      console.log("🚀 Enviando Payload:", payload);

      // 4. Criação do Imóvel
      const newProperty = await propertyService.create(payload);
      console.log("✅ Imóvel criado! ID:", newProperty.id);

      // 5. Upload das Fotos (se houver)
      if (formData.images && formData.images.length > 0) {
        console.log(`📸 Enviando ${formData.images.length} imagens...`);
        // O backend deve retornar o ID no objeto criado. Ajuste se o campo for diferente (ex: newProperty.propertyId)
        await propertyService.uploadPhotos(newProperty.id, formData.images);
      }

      // Sucesso!
      setIsModalOpen(true);

    } catch (error: any) {
      console.error("❌ Erro no envio:", error);
      
      let msg = "Erro desconhecido.";
      if (error.response?.data) {
        if (error.response.data.errors) {
            msg = error.response.data.errors.map((e: any) => e.defaultMessage).join(", ");
        } else {
            msg = error.response.data.message || JSON.stringify(error.response.data);
        }
      }
      alert(`Falha ao criar anúncio: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="create-ad-page">
      
      {/* Cabeçalho */}
      <header className="header-wrapper">
        <div className="header-container">
          <h1 className="page-title">Publicar Anúncio</h1>

          {/* Stepper Visual */}
          <div className="stepper">
            
            {/* Passo 1 - Detalhes (Ativo se step >= 1) */}
            <div className="step-group">
              <div className={`step-icon ${step >= 1 ? 'active' : 'inactive'}`}>
                <UserCircleIcon style={{ width: '28px' }} />
              </div>
              <span className="step-text">Detalhes do Imóvel/Quarto</span>
            </div>

            <div className="step-line"></div>

            {/* Passo 2 - Preview (Ativo se step >= 7, pois é o penúltimo antes de publicar) */}
            {/* Nota: Simplifiquei a barra visual para 3 grandes marcos, mas internamente temos 7 passos */}
            <div className="step-group">
              <div className={`step-icon ${step >= 7 ? 'active' : 'inactive'}`}>
                <DocumentTextIcon style={{ width: '24px' }} />
              </div>
              <span className="step-text">Pré-visualizar Anúncio</span>
            </div>

            <div className="step-line"></div>

            {/* Passo 3 - Publicar (Ativo só no final) */}
            <div className="step-group">
              <div className={`step-icon ${isModalOpen ? 'active' : 'inactive'}`}>
                <CheckCircleIcon style={{ width: '24px' }} />
              </div>
              <span className="step-text">Publicar Anúncio</span>
            </div>

          </div>
        </div>
      </header>

      {/* Conteúdo do Formulário */}
      <section className="content-wrapper">
        <div className="step-container">
          
          {step === 1 && (
            <DetailsStep data={formData} updateData={updateData} onNext={nextStep} />
          )}

          {step === 2 && (
            <RentStep data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} />
          )}

          {step === 3 && (
            <AmenitiesStep data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} />
          )}

          {step === 4 && (
            <HouseRulesStep data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} />
          )}

          {step === 5 && (
            <DescriptionStep data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} />
          )}

          {step === 6 && (
            <MediaStep data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} />
          )}

          {step === 7 && (
            <PreviewStep 
              data={formData} 
              onBack={prevStep}
              onNext={handleFinish} 
              isLoading={isSubmitting}
            />
          )}

        </div>
      </section>

      {/* Modal de Sucesso */}
      <SuccessModal 
        isOpen={isModalOpen} 
        onClose={() => router.push('/dashboard')} // Redireciona para dashboard após sucesso
      />

    </main>
  );
}