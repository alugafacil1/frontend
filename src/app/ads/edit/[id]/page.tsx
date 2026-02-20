"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

export default function EditAdPage() {
  const router = useRouter();
  const params = useParams(); 
  const { user } = useAuth(); 
  
  const rawId = params?.id || params?.propertyId;
  const propertyId = Array.isArray(rawId) ? rawId[0] : rawId; 

  const [step, setStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState<any>({
    country: '', city: '', postalCode: '', propertyType: '',
    number: '', address: '', rooms: '', bathrooms: '',
    contactPhone: '', 
    monthlyRent: '', weeklyRent: '', minTenancy: '',
    deposit: '', moveInDate: '', maxAttendants: '',
    amenities: [], houseRules: [],
    title: '', description: '', images: [], videoLink: ''
  });

  // Carregamento dos dados iniciais do imóvel
  useEffect(() => {
    async function loadProperty() {
      if (!propertyId || propertyId === 'undefined') return;

      try {
        console.log(`🔍 DEBUG: Buscando imóvel ID: ${propertyId}`);
        const data = await propertyService.getById(propertyId);
        console.log("✅ DEBUG: Dados recebidos do backend:", data);

        if (user && data.userId && user.id !== data.userId) {
          alert("Sem permissão para editar este anúncio.");
          router.push("/ads/my-properties"); 
          return;
        }

        const formatCurrency = (cents: number) => {
          if (!cents && cents !== 0) return "";
          return (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
        };

        // MAPEAMENTO DE ENTRADA (BACKEND -> FORM)
        setFormData({
          // Ajuste: Se o estado for 'Brasil' ou null, define 'br' para o seletor. Caso contrário, mantém o valor original.
          country: (data.address?.state === 'Brasil' || !data.address?.state) ? 'br' : data.address.state, 
          city: data.address?.city || "",
          // Ajuste: Suporta 'zipCode' ou 'postalCode' vindo do backend
          postalCode: data.address?.zipCode || data.address?.postalCode || "",
          propertyType: data.type || "APARTMENT",
          number: data.address?.number || "",
          address: data.address?.street || "",
          rooms: String(data.numberOfBedrooms || "0"),
          bathrooms: String(data.numberOfBathrooms || "0"),
          contactPhone: data.phoneNumber || "",
          monthlyRent: formatCurrency(data.priceInCents),
          amenities: data.amenities || [],
          houseRules: data.houseRules || [],
          title: data.title || "",
          description: data.description || "",
          images: data.photoUrls || [],
          videoLink: data.videoUrl || ""
        });
      } catch (error) {
        console.error("❌ DEBUG: Erro no loadProperty:", error);
      } finally {
        setFetching(false);
      }
    }
    if (user && propertyId) loadProperty();
  }, [propertyId, user, router]);

  const updateData = (newData: any) => setFormData((prev: any) => ({ ...prev, ...newData }));
  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleUpdate = async () => {
    if (!propertyId || propertyId === 'undefined') return;

    setIsSubmitting(true);
    
    try {
      const cleanPrice = formData.monthlyRent.replace(/[^\d,]/g, '').replace(',', '.');
      const priceInCents = Math.round(parseFloat(cleanPrice) * 100) || 0;

      const hasAmenity = (keyword: string) => 
        formData.amenities.some((a: string) => a.toLowerCase().includes(keyword.toLowerCase()));
      
      const hasRule = (keyword: string) => 
        formData.houseRules.some((r: string) => r.toLowerCase().includes(keyword.toLowerCase()));

      // MAPEAMENTO DE SAÍDA (FORM -> BACKEND)
      const payload = {
        title: formData.title || "Imóvel atualizado",
        description: formData.description,
        address: {
          street: formData.address,
          number: formData.number,
          city: formData.city,
          // Ajuste: Salva 'Brasil' se for 'br', senão salva o código do país/estado selecionado
          state: formData.country === 'br' ? 'Brasil' : (formData.country || "Brasil"), 
          postalCode: formData.postalCode, 
          neighborhood: formData.neighborhood || "Centro" 
        },
        geolocation: {
          latitude: formData.lat || 0.0,
          longitude: formData.lon || 0.0
        },
        priceInCents,
        numberOfRooms: parseInt(formData.rooms) || 0,
        numberOfBedrooms: parseInt(formData.rooms) || 0, 
        numberOfBathrooms: parseInt(formData.bathrooms) || 0,
        furnished: !!hasAmenity('Mobiliado') || !!hasAmenity('Furnished'),
        petFriendly: !!hasRule('Animais permitidos') || !!hasRule('Pets Allowed'),
        garage: !!hasAmenity('Garagem') || !!hasAmenity('Estacionamento') || !!hasAmenity('Garage'),
        isOwner: true,
        videoUrl: formData.videoLink || "",
        phoneNumber: formData.contactPhone,
        photoUrls: formData.images.filter((img: any) => typeof img === 'string'), 
        type: formData.propertyType?.toUpperCase() || "APARTMENT",
        userId: user?.id,
        amenities: formData.amenities || [],
        houseRules: formData.houseRules || []
      };

      console.log("🚀 DEBUG: Enviando payload corrigido:", payload);

      await propertyService.update(propertyId, payload);
      
      const newImages = formData.images.filter((img: any) => img instanceof File);
      if (newImages.length > 0) {
        await propertyService.uploadPhotos(propertyId, newImages);
      }

      setIsModalOpen(true);

    } catch (error: any) {
      console.error("❌ DEBUG: Erro no envio:", error);
      if (error.response?.data) {
        console.log("📝 DETALHES DO ERRO DO BACKEND:", error.response.data);
      }
      alert("Erro ao atualizar anúncio. Verifique o console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (fetching) return <div className="loading-screen">Carregando...</div>;

  return (
    <main className="create-ad-page">
      <header className="header-wrapper">
        <div className="header-container">
          <h1 className="page-title">Editar Anúncio</h1>
          <div className="stepper">
            <div className={`step-group ${step >= 1 ? 'active' : ''}`}>
              <div className="step-icon"><UserCircleIcon style={{ width: '28px' }} /></div>
              <span className="step-text">Detalhes</span>
            </div>
            <div className="step-line"></div>
            <div className={`step-group ${step >= 7 ? 'active' : ''}`}>
              <div className="step-icon"><DocumentTextIcon style={{ width: '24px' }} /></div>
              <span className="step-text">Revisão</span>
            </div>
            <div className="step-line"></div>
            <div className={`step-group ${isModalOpen ? 'active' : ''}`}>
              <div className="step-icon"><CheckCircleIcon style={{ width: '24px' }} /></div>
              <span className="step-text">Sucesso</span>
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
          {step === 7 && (
            <PreviewStep 
              data={formData} 
              onBack={prevStep}
              onNext={handleUpdate} 
              isLoading={isSubmitting}
            />
          )}
        </div>
      </section>

      {isModalOpen && (
        <SuccessModal 
          isOpen={isModalOpen}
          isEditing={true}
          onClose={() => router.push('/ads/my-properties')} 
        />
      )}
    </main>
  );
}