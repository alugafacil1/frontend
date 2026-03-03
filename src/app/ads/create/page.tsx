"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserIcon, DocumentTextIcon, CheckIcon } from "@heroicons/react/24/solid";
import "../../../assets/styles/ads/CreateAd.css";

// Components
import { DetailsStep } from "@/components/steps/DetailsStep";
import { RentStep } from "@/components/steps/RentStep"; 
import { AmenitiesStep } from "@/components/steps/AmenitiesStep"; 
import { HouseRulesStep } from "@/components/steps/HouseRulesStep"; 
import { DescriptionStep } from "@/components/steps/DescriptionStep"; 
import { MediaStep } from "@/components/steps/MediaStep"; 
import { PreviewStep } from "@/components/steps/PreviewStep"; 
import { SuccessModal } from "@/components/SuccessModal";

export default function CreateAdPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step 1, 2, 3 & 4
    country: '', city: '', postalCode: '', propertyType: '',
    number: '', address: '', rooms: '', bathrooms: '',
    monthlyRent: '', weeklyRent: '', minTenancy: '',
    deposit: '', moveInDate: '', maxAttendants: '',
    amenities: [], houseRules: [],
    
    // Step 5 & 6
    title: '', description: '', images: [], videoLink: '' // videoLink adicionado
  });

  const updateData = (newData: any) => setFormData(prev => ({ ...prev, ...newData }));

  return (
    <main className="create-ad-page">
      <header className="header-wrapper">
        <div className="header-container">
          <h1 className="page-title">Post an Ad</h1>
          
          <div className="stepper">
            {/* Ícone 1: Detalhes do Imóvel (Passos 1 ao 5) */}
            <div className="step-group">
              <div className={`step-icon ${step <= 5 ? 'active' : 'active'}`}> 
                <UserIcon style={{width: '20px'}} />
              </div>
              <span className={`step-text ${step <= 5 ? 'active' : ''}`}>
                Property Details
              </span>
            </div>
            
            <div className="step-line"></div>

            {/* Ícone 2: Preview & Media (Passos 6 e 7) */}
            <div className="step-group">
              <div className={`step-icon ${step >= 6 ? 'active' : ''}`}>
                <DocumentTextIcon style={{width: '20px'}} />
              </div>
              <span className={`step-text ${step >= 6 ? 'active' : ''}`}>
                Preview Listing
              </span>
            </div>

            <div className="step-line"></div>

            {/* Ícone 3: Publish (Passo 8) */}
            <div className="step-group">
              <div className={`step-icon ${step >= 8 ? 'active' : ''}`}>
                <CheckIcon style={{width: '20px'}} />
              </div>
              <span className={`step-text ${step >= 8 ? 'active' : ''}`}>
                Publish
              </span>
            </div>
          </div>
        </div>
      </header>

      <section className="content-wrapper">
        <div className="form-card">
          {/* Fluxo de Passos */}
          {step === 1 && <DetailsStep data={formData} updateData={updateData} onNext={() => setStep(2)} />}
          {step === 2 && <RentStep data={formData} updateData={updateData} onNext={() => setStep(3)} />}
          {step === 3 && <AmenitiesStep data={formData} updateData={updateData} onNext={() => setStep(4)} />}
          {step === 4 && <HouseRulesStep data={formData} updateData={updateData} onNext={() => setStep(5)} />}
          {step === 5 && <DescriptionStep data={formData} updateData={updateData} onNext={() => setStep(6)} />}
          {step === 6 && <MediaStep data={formData} updateData={updateData} onNext={() => setStep(7)} />}

          {/* Revisão Final com Carrossel Mosaico */}
          {step === 7 && (
            <PreviewStep 
              data={formData} 
              onNext={() => {
                setStep(8);
                setIsModalOpen(true);
              }}
            />
          )}
        </div>
      </section>

      {/* Modal de Finalização */}
      <SuccessModal 
        isOpen={isModalOpen} 
        onClose={() => router.push('/')} 
      />
    </main>
  );
}