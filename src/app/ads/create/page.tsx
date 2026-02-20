"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';


import { UserCircleIcon, DocumentTextIcon, CheckCircleIcon } from "@heroicons/react/24/solid";


import { useAuth } from "@/lib/auth/useAuth";


import { propertyService } from "@/services/property/propertyService";


import "@/assets/styles/ads/CreateAd.css"; 


import { DetailsStep } from "@/components/steps/DetailsStep";
import { RentStep } from "@/components/steps/RentStep"; 
import { AmenitiesStep } from "@/components/steps/AmenitiesStep"; 
import { HouseRulesStep } from "@/components/steps/HouseRulesStep"; 
import { DescriptionStep } from "@/components/steps/DescriptionStep"; 
import { MediaStep } from "@/components/steps/MediaStep"; 
import { PreviewStep } from "@/components/steps/PreviewStep"; 
import { SuccessModal } from "@/components/SuccessModal";


interface FormData {
  // Step 1 - Details
  country: string; 
  city: string; 
  postalCode: string; 
  propertyType: string;
  number: string; 
  address: string; 
  neighborhood?: string; // Adicionado para evitar erro de campo faltante no payload
  rooms: string; 
  bathrooms: string;
  contactPhone: string;
  lat?: number; // Armazena a latitude para o payload de geolocalização
  lon?: number; // Armazena a longitude para o payload de geolocalização
  
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
  // AJUSTE: Aceita File (novas fotos) ou string (URLs de fotos já existentes no banco)
  images: (File | string)[]; 
  videoLink: string;
}

export default function CreateAdPage() {
  const router = useRouter();
  const { user } = useAuth(); 
  
  const [step, setStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
 
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

  
  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

 
const handleFinish = async () => {
  // Validação de segurança para garantir que o usuário está logado
  if (!user || !user.id) {
    alert("Erro: Usuário não identificado. Faça login novamente.");
    return;
  }

  setIsSubmitting(true);
  console.log("🚀 DEBUG: Iniciando processo de criação de anúncio...");
  
  try {
    // Tratamento de preço: conversão de string formatada para centavos
    const cleanPriceString = formData.monthlyRent.replace(/[^\d,]/g, '').replace(',', '.');
    const priceFloat = parseFloat(cleanPriceString) || 0;
    const priceInCents = Math.round(priceFloat * 100);

    // Helpers para converter tags de amenities/rules em booleanos
    const hasAmenity = (keyword: string) => 
      formData.amenities.some((a: any) => a.toLowerCase().includes(keyword.toLowerCase()));
    
    const hasRule = (keyword: string) => 
      formData.houseRules.some((r: any) => r.toLowerCase().includes(keyword.toLowerCase()));

    // Montagem do Payload de Criação
    const payload = {
      title: formData.title || "Imóvel sem título",
      description: formData.description || "Sem descrição",
      
      address: {
        street: formData.address,
        // CORREÇÃO: Garante que o número não vá vazio para evitar erro 400
        number: formData.number && formData.number.trim() !== "" ? formData.number : "S/N",
        city: formData.city,
        state: formData.country === 'br' ? 'Brasil' : (formData.country || "Brasil"), 
        postalCode: formData.postalCode,
        neighborhood: formData.neighborhood || "Centro" 
      },
      
      geolocation: {
        latitude: formData.lat || 0.0, 
        longitude: formData.lon || 0.0
      },

      priceInCents: priceInCents,
      
      numberOfRooms: parseInt(formData.rooms) || 0,
      numberOfBedrooms: parseInt(formData.rooms) || 0, 
      numberOfBathrooms: parseInt(formData.bathrooms) || 0,
      
      // Conversão explícita para booleanos (NotNull no backend)
      furnished: !!(hasAmenity('Furnished') || hasAmenity('Mobiliado')),
      petFriendly: !!(hasRule('Pets Allowed') || hasRule('Animais permitidos')),
      garage: !!(hasAmenity('Garage') || hasAmenity('Parking') || hasAmenity('Estacionamento')),
      
      isOwner: true,
      videoUrl: formData.videoLink || "",
      phoneNumber: formData.contactPhone || "0000000000",
      
      photoUrls: [], 
      status: "ACTIVE", 
      type: formData.propertyType ? formData.propertyType.toUpperCase() : "APARTMENT",
      
      userId: user.id 
    };

    console.log("📡 DEBUG: Enviando Payload de Criação:", payload);

    // 1. Criar o imóvel e aguardar a resposta com o ID gerado
    const response = await propertyService.create(payload);
    
    // 2. Captura robusta do ID (o log mostrou 'propertyId')
    const createdId = response.id || response.propertyId;
    
    if (!createdId) {
      throw new Error("O servidor não retornou um ID válido para o novo imóvel.");
    }

    console.log("✅ DEBUG: Imóvel criado com sucesso! ID:", createdId);

    // 3. Upload de fotos utilizando o ID real recém-criado
    const newImages = formData.images.filter((img: any) => img instanceof File);
    
    if (newImages.length > 0) {
      console.log(`📸 DEBUG: Enviando ${newImages.length} imagens para o ID ${createdId}...`);
      await propertyService.uploadPhotos(createdId, newImages);
      console.log("✅ DEBUG: Upload de fotos concluído.");
    }

    // 4. Feedback visual de sucesso
    setIsModalOpen(true);

  } catch (error: any) {
    console.error("❌ DEBUG: Falha no processo de criação:", error);
    
    let msg = "Erro desconhecido ao processar sua solicitação.";
    
    if (error.response?.data) {
      console.log("📝 DETALHES DO ERRO DO BACKEND:", error.response.data);
      // Tenta extrair mensagens de validação específicas (como a do campo number)
      msg = error.response.data.message || JSON.stringify(error.response.data);
    }
    
    alert(`Falha ao criar anúncio: ${msg}`);
  } finally {
    setIsSubmitting(false);
    console.log("🏁 DEBUG: handleFinish finalizado.");
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

      
      <SuccessModal 
        isOpen={isModalOpen} 
        onClose={() => router.push('/ads/my-properties')} 
      />

    </main>
  );
}