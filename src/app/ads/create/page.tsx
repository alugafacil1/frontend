"use client";

import React, { useState, useEffect } from 'react';
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
  neighborhood?: string; 
  rooms: string; 
  bathrooms: string;
  contactPhone: string;
  lat?: number; 
  lon?: number; 
  
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

  // =================================================================
  // PROTEÇÃO DE ROTA: Apenas OWNER e REALTOR podem ver essa tela
  // =================================================================
  useEffect(() => {
    if (user) {
      const role = user.role as string;
      // Se for inquilino (TENANT) ou agência (AGENCY_ADMIN), joga pra fora
      if (role !== 'OWNER' && role !== 'REALTOR') {
        router.push('/ads/my-properties'); 
      }
    }
  }, [user, router]);

  const updateData = (newData: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleFinish = async () => {
    if (!user || !user.id) {
      alert("Erro: Usuário não identificado. Faça login novamente.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Helper para converter valores monetários em string para centavos (inteiro)
      const parseCurrencyToCents = (val: string) => {
        if (!val) return undefined;
        const cleanStr = val.replace(/[^\d,]/g, '').replace(',', '.');
        const floatVal = parseFloat(cleanStr);
        return isNaN(floatVal) ? undefined : Math.round(floatVal * 100);
      };

      const priceInCents = parseCurrencyToCents(formData.monthlyRent) || 0;

      // Helpers para converter tags de amenities/rules em booleanos
      const hasAmenity = (keyword: string) => 
        formData.amenities.some((a: any) => a.toLowerCase().includes(keyword.toLowerCase()));
      
      const hasRule = (keyword: string) => 
        formData.houseRules.some((r: any) => r.toLowerCase().includes(keyword.toLowerCase()));

      // =================================================================
      // LÓGICA DE STATUS: Agente -> PENDING | Proprietário -> ACTIVE
      // =================================================================
      const isRealtor = (user.role as string) === 'REALTOR';
      const initialStatus = isRealtor ? 'PENDING' : 'ACTIVE';
      
      
      const payload = {
        title: formData.title || "Imóvel sem título",
        description: formData.description || "Sem descrição",
        
        address: {
          street: formData.address,
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
        weeklyRentInCents: parseCurrencyToCents(formData.weeklyRent),
        securityDepositInCents: parseCurrencyToCents(formData.deposit),
        minimumLeaseMonths: formData.minTenancy ? parseInt(formData.minTenancy, 10) : undefined,
        maxOccupants: formData.maxAttendants ? parseInt(formData.maxAttendants, 10) : undefined,
        availableFrom: formData.moveInDate ? formData.moveInDate : undefined,

        amenities: formData.amenities || [],
        houseRules: formData.houseRules || [],
        
        numberOfRooms: parseInt(formData.rooms) || 0,
        numberOfBedrooms: parseInt(formData.rooms) || 0, 
        numberOfBathrooms: parseInt(formData.bathrooms) || 0,
        
        furnished: !!(hasAmenity('Furnished') || hasAmenity('Mobiliado')),
        petFriendly: !!(hasRule('Pets Allowed') || hasRule('Animais permitidos')),
        garage: !!(hasAmenity('Garage') || hasAmenity('Parking') || hasAmenity('Estacionamento')),
        
        isOwner: true,
        videoUrl: formData.videoLink || "",
        phoneNumber: formData.contactPhone || "0000000000",
        
        photoUrls: [], 
        status: initialStatus, 
        type: formData.propertyType ? formData.propertyType.toUpperCase() : "APARTMENT",
        
        userId: user.id 
      };

      const response = await propertyService.create(payload);
      console.log(response)
      const createdId = response.id || response.propertyId;
      
      if (!createdId) {
        throw new Error("O servidor não retornou um ID válido para o novo imóvel.");
      }

      const newImages = formData.images.filter((img: any) => img instanceof File);
      
      if (newImages.length > 0) {
        await propertyService.uploadPhotos(createdId, newImages);
      }

      setIsModalOpen(true);

    } catch (error: any) {
      let msg = "Erro desconhecido ao processar sua solicitação.";
      
      if (error.response?.data) {
        msg = error.response.data.message || JSON.stringify(error.response.data);
      }
      
      alert(`Falha ao criar anúncio: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Previne renderização da tela enquanto redireciona um usuário sem permissão
  if (user && user.role !== 'OWNER' && user.role !== 'REALTOR') {
    return null; 
  }

  return (
    <main className="create-ad-page">
      <header className="header-wrapper">
        <div className="header-container">
          <h1 className="page-title">Publicar Anúncio</h1>
          <div className="stepper">
            <div className="step-group">
              <div className={`step-icon ${step >= 1 ? 'active' : 'inactive'}`}>
                <UserCircleIcon style={{ width: '28px' }} />
              </div>
              <span className="step-text">Detalhes do Imóvel/Quarto</span>
            </div>
            <div className="step-line"></div>
            <div className="step-group">
              <div className={`step-icon ${step >= 7 ? 'active' : 'inactive'}`}>
                <DocumentTextIcon style={{ width: '24px' }} />
              </div>
              <span className="step-text">Pré-visualizar Anúncio</span>
            </div>
            <div className="step-line"></div>
            <div className="step-group">
              <div className={`step-icon ${isModalOpen ? 'active' : 'inactive'}`}>
                <CheckCircleIcon style={{ width: '24px' }} />
              </div>
              <span className="step-text">Publicar Anúncio</span>
            </div>
          </div>
        </div>
      </header>

      <section className="content-wrapper">
        <div className="step-container">
          {step === 1 && <DetailsStep data={formData} updateData={updateData} onNext={nextStep} />}
          {step === 2 && <RentStep data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
          {step === 3 && <AmenitiesStep data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
          {step === 4 && <HouseRulesStep data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
          {step === 5 && <DescriptionStep data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
          {step === 6 && <MediaStep data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
          {step === 7 && <PreviewStep data={formData} onBack={prevStep} onNext={handleFinish} isLoading={isSubmitting} />}
        </div>
      </section>

      <SuccessModal isOpen={isModalOpen} onClose={() => router.push('/ads/my-properties')} />
    </main>
  );
}