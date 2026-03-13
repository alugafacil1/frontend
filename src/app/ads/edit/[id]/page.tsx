"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon, CalendarIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/lib/auth/useAuth";
import { propertyService } from "@/services/property/propertyService";
import { SuccessModal } from "@/components/SuccessModal";
import "@/assets/styles/ads/EditAdUnified.css"; 

// --- SEUS HOOKS ---
import { useCep } from "../../../../../hooks/useCep"; 
import { useLocation } from "../../../../../hooks/useLocation"; 
import { useMasks } from "../../../../../hooks/useMasks";
import { useGeolocation } from "../../../../../hooks/useGeolocation";

// ============================================================================
// 1. COMPONENTES DE INTERFACE
// ============================================================================

const OutlinedInput = ({ label, name, value, onChange, onBlur, type = "text", icon: Icon, ...props }: any) => (
  <div className="outlined-input-wrapper">
    <label className="outlined-label">{label}</label>
    <input 
      type={type} 
      name={name} 
      value={value || ''} 
      onChange={onChange} 
      onBlur={onBlur}
      className="outlined-field" 
      {...props} 
    />
    {Icon && <Icon className="input-icon" />}
  </div>
);

const CustomToggle = ({ label, name, checked, onChange }: { label: string, name: string, checked: boolean, onChange: any }) => (
  <div className="toggle-item">
    <span className="toggle-label">{label}</span>
    <label className="toggle-switch">
      <input type="checkbox" name={name} checked={!!checked} onChange={onChange} />
      <span className="toggle-slider"></span>
    </label>
  </div>
);

// ============================================================================
// 2. PÁGINA PRINCIPAL
// ============================================================================

export default function EditAdPage() {
  const router = useRouter();
  const params = useParams(); 
  const { user } = useAuth(); 
  
  const rawId = params?.id || params?.propertyId;
  const propertyId = (Array.isArray(rawId) ? rawId[0] : rawId) as string; 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Referência para o input de arquivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- ESTADO UNIFICADO ---
  const [formData, setFormData] = useState<any>({
    country: 'Brazil', 
    cep: '', number: '', rooms: '', city: '', propertyType: '', address: '', bathrooms: '',
    monthlyRent: '', weeklyRent: '', availableFrom: '', minTenancy: '', deposit: '', maxOccupants: '',
    hasAgua: false, hasLuz: false, hasIPTU: false, hasGas: false, hasInternet: false, hasCondominio: false,
    hasGaragem: false, hasAnimais: false, hasFumantes: false, hasSacada: false, hasMobiliado: false, hasArCondicionado: false,
    hasChurrasqueira: false, hasElevador: false, hasPortaria: false,
    hasVisitaVirtual: false, youtubeLink: '', description: '', images: [],
    agencyId: null
  });

  // --- INICIANDO HOOKS ---
  const { fetchAddress, maskCep: cepMasker } = useCep(); 
  const { countries, cities, loadingCities } = useLocation(formData.country); 
  const { maskCurrency, maskNumber, unmaskCurrency } = useMasks();
  const { fetchCoordinates } = useGeolocation();

  // --- CARREGAMENTO DO IMÓVEL ---
  useEffect(() => {
    async function loadProperty() {
      if (!propertyId || propertyId === 'undefined') return;

      try {
        const data = await propertyService.getById(propertyId);

        const formatCurrencyFromBackend = (cents: number) => cents ? (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "";
        const checkAmenity = (term: string) => data.amenities?.some((a: string) => a.toLowerCase().includes(term.toLowerCase()));
        const checkRule = (term: string) => data.houseRules?.some((r: string) => r.toLowerCase().includes(term.toLowerCase()));

        setFormData((prev: any) => ({
          ...prev,
          country: (data.address?.state === 'Brasil' || !data.address?.state) ? 'Brazil' : data.address.state, 
          city: data.address?.city || "",
          cep: cepMasker(data.address?.zipCode || data.address?.postalCode || ""),
          propertyType: data.type || "APARTMENT",
          number: data.address?.number || "",
          address: data.address?.street || "",
          rooms: String(data.numberOfBedrooms || ""),
          bathrooms: String(data.numberOfBathrooms || ""),
          monthlyRent: formatCurrencyFromBackend(data.priceInCents),
          weeklyRent: formatCurrencyFromBackend(data.weeklyRentInCents),
          deposit: formatCurrencyFromBackend(data.securityDepositInCents),
          minTenancy: data.minimumLeaseMonths ? String(data.minimumLeaseMonths) : "",
          maxOccupants: data.maxOccupants ? String(data.maxOccupants) : "",
          availableFrom: data.availableFrom || "",
          hasAgua: checkAmenity('Água') || checkAmenity('Agua'),
          hasLuz: checkAmenity('Luz') || checkAmenity('Energia'),
          hasIPTU: checkAmenity('IPTU'),
          hasGas: checkAmenity('Gás') || checkAmenity('Gas'),
          hasInternet: checkAmenity('Internet') || checkAmenity('Wi-fi'),
          hasCondominio: checkAmenity('Condomínio'),
          hasGaragem: data.garage || checkAmenity('Garagem'),
          hasAnimais: data.petFriendly || checkRule('Animais'),
          hasFumantes: checkRule('Fumantes'),
          hasSacada: checkAmenity('Sacada') || checkAmenity('Varanda'),
          hasMobiliado: data.furnished || checkAmenity('Mobiliado'),
          hasArCondicionado: checkAmenity('Ar-condicionado'),
          hasChurrasqueira: checkAmenity('Churrasqueira'),
          hasElevador: checkAmenity('Elevador'),
          hasPortaria: checkAmenity('Portaria') || checkAmenity('Segurança'),
          hasVisitaVirtual: !!data.videoUrl,
          youtubeLink: data.videoUrl || "",
          description: data.description || "",
          images: data.photoUrls || [],
          agencyId: data.agencyId || null
        }));
        
      } catch (error) {
        console.error("Erro ao carregar:", error);
      } finally {
        setFetching(false);
      }
    }
    
    
    if (user?.id && propertyId) loadProperty();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, user?.id]); 

  // --- HANDLERS DE FORMULÁRIO ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev: any) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (['monthlyRent', 'weeklyRent', 'deposit'].includes(name)) {
      setFormData((prev: any) => ({ ...prev, [name]: maskCurrency(value) }));
    } else if (['rooms', 'bathrooms', 'minTenancy', 'maxOccupants'].includes(name)) {
      setFormData((prev: any) => ({ ...prev, [name]: maskNumber(value) }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev: any) => ({ ...prev, cep: cepMasker(e.target.value) }));
  };

  const handleCepBlur = async () => {
    const cleanCep = formData.cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      const addressData = await fetchAddress(cleanCep);
      if (addressData) {
        setFormData((prev: any) => ({
          ...prev,
          address: addressData.address || prev.address,
          city: addressData.city || prev.city,
        }));
      }
    }
  };

  // --- HANDLERS DE IMAGEM ---
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    
    setFormData((prev: any) => ({
      ...prev,
      images: [...prev.images, ...newFiles]
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData((prev: any) => ({
      ...prev,
      images: prev.images.filter((_: any, index: number) => index !== indexToRemove)
    }));
  };

  // --- SUBMIT ---
  const handleUpdate = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const amenities = [];
      if (formData.hasAgua) amenities.push("Água inclusa");
      if (formData.hasLuz) amenities.push("Luz inclusa");
      if (formData.hasIPTU) amenities.push("IPTU incluso");
      if (formData.hasGas) amenities.push("Gás incluso");
      if (formData.hasInternet) amenities.push("Internet");
      if (formData.hasCondominio) amenities.push("Condomínio incluso");
      if (formData.hasGaragem) amenities.push("Vaga de Garagem");
      if (formData.hasSacada) amenities.push("Sacada / Varanda");
      if (formData.hasMobiliado) amenities.push("Mobiliado");
      if (formData.hasArCondicionado) amenities.push("Ar-condicionado");
      if (formData.hasChurrasqueira) amenities.push("Churrasqueira");
      if (formData.hasElevador) amenities.push("Elevador");
      if (formData.hasPortaria) amenities.push("Portaria / Segurança");

      const rules = [];
      if (formData.hasAnimais) rules.push("Aceita Animais");
      if (formData.hasFumantes) rules.push("Aceita Fumantes");

      const stateForBackend = formData.country === 'Brazil' ? 'Brasil' : formData.country;
      const fullAddressQuery = `${formData.address}, ${formData.number}, ${formData.city}, ${stateForBackend}`;
      const coords = await fetchCoordinates(fullAddressQuery);

      const isRealtor = user?.role === 'REALTOR';
      const initialStatus = isRealtor ? 'PENDING' : 'ACTIVE';

      const payload = {
        title: formData.title || "Imóvel atualizado", 
        description: formData.description,
        address: {
          street: formData.address,
          number: formData.number || "S/N",
          city: formData.city,
          state: stateForBackend, 
          postalCode: formData.cep, 
          neighborhood: "Centro" 
        },
        userId: user?.id,
        agencyId: formData.agencyId || user?.agencyId || null,
        status: initialStatus, 
        isOwner: user?.role === 'OWNER', 
        phoneNumber: user?.phoneNumber || "00000000000", 
        geolocation: {
          latitude: coords.latitude,
          longitude: coords.longitude
        },
        priceInCents: unmaskCurrency(formData.monthlyRent) * 100,
        weeklyRentInCents: unmaskCurrency(formData.weeklyRent) * 100,
        securityDepositInCents: unmaskCurrency(formData.deposit) * 100,
        minimumLeaseMonths: formData.minTenancy ? parseInt(formData.minTenancy) : undefined,
        maxOccupants: formData.maxOccupants ? parseInt(formData.maxOccupants) : undefined,
        availableFrom: formData.availableFrom || undefined,
        numberOfBedrooms: parseInt(formData.rooms) || 0, 
        numberOfBathrooms: parseInt(formData.bathrooms) || 0,
        furnished: formData.hasMobiliado,
        petFriendly: formData.hasAnimais,
        garage: formData.hasGaragem,
        videoUrl: formData.hasVisitaVirtual ? formData.youtubeLink : "",
        photoUrls: formData.images.filter((img: any) => typeof img === 'string'), 
        type: formData.propertyType?.toUpperCase() || "APARTMENT",
        amenities: amenities,
        houseRules: rules
      };

      await propertyService.update(propertyId, payload);

      const newImages = formData.images.filter((img: any) => img instanceof File);
      if (newImages.length > 0) {
        await propertyService.uploadPhotos(propertyId, newImages);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsModalOpen(true);

    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao atualizar anúncio.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (fetching) return <div className="loading-container"><div className="loading-spinner"></div></div>;

  return (
    <main className="unified-edit-page">
      <div className="unified-container">
        
        {/* SEÇÃO 1: IMAGENS */}
        <section className="unified-section">
          <div className="section-header">
            <h2 className="section-title">Imagens</h2>
            
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              style={{ display: 'none' }} 
            />

            <button type="button" className="btn-add-img" onClick={triggerFileInput}>
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="image-gallery-grid">
            {formData.images.length > 0 ? (
              formData.images.map((img: any, i: number) => {
                const imgSrc = img instanceof File ? URL.createObjectURL(img) : img;
                
                return (
                  <div key={i} className="gallery-img-box" style={{ position: 'relative' }}>
                    <img src={imgSrc} alt={`Foto ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    
                    <button 
                      type="button"
                      onClick={() => removeImage(i)}
                      style={{
                        position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.6)', 
                        color: 'white', borderRadius: '50%', padding: '4px', border: 'none', cursor: 'pointer'
                      }}
                      title="Remover imagem"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="no-images-placeholder">Nenhuma imagem carregada</div>
            )}
          </div>
        </section>

        {/* SEÇÃO 2: DETALHES DO IMÓVEL */}
        <section className="unified-section">
          <h2 className="section-title">Detalhes do Imóvel</h2>
          
          <div className="form-grid-3">
            <div className="outlined-input-wrapper">
              <label className="outlined-label">Selecione o País</label>
              <select name="country" value={formData.country} onChange={handleChange} className="outlined-field">
                {countries.length > 0 ? countries.map((c: any) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                )) : <option value="Brazil">Brasil 🇧🇷</option>}
              </select>
            </div>

            <OutlinedInput label="CEP" name="cep" value={formData.cep} onChange={handleCepChange} onBlur={handleCepBlur} placeholder="00000-000" maxLength={9} />
            <OutlinedInput label="Número" name="number" value={formData.number} onChange={handleChange} />
            <OutlinedInput label="Número de Quartos" name="rooms" value={formData.rooms} onChange={handleChange} />
            
            <div className="outlined-input-wrapper">
              <label className="outlined-label">Cidade</label>
              <select name="city" value={formData.city} onChange={handleChange} className="outlined-field" disabled={loadingCities}>
                <option value="" disabled>{loadingCities ? 'Carregando...' : 'Selecione'}</option>
                {cities?.map((city: any, idx: number) => (
                  <option key={idx} value={city.value}>{city.label}</option>
                ))}
              </select>
            </div>
            
            <div className="outlined-input-wrapper">
              <label className="outlined-label">Tipo</label>
              <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="outlined-field">
                <option value="APARTMENT">Apartamento</option>
                <option value="HOUSE">Casa</option>
                <option value="ROOM">Quarto</option>
              </select>
            </div>

            <div style={{ gridColumn: 'span 2' }}><OutlinedInput label="Endereço" name="address" value={formData.address} onChange={handleChange} /></div>
            <OutlinedInput label="Banheiros" name="bathrooms" value={formData.bathrooms} onChange={handleChange} />
          </div>

          <hr className="section-divider" />

          <div className="form-grid-3">
            <OutlinedInput label="Mensal" name="monthlyRent" value={formData.monthlyRent} onChange={handleChange} />
            <OutlinedInput label="Semanal" name="weeklyRent" value={formData.weeklyRent} onChange={handleChange} />
            <OutlinedInput label="Disponível em" name="availableFrom" value={formData.availableFrom} onChange={handleChange} type="date" icon={CalendarIcon} />
            <OutlinedInput label="Contrato Mínimo" name="minTenancy" value={formData.minTenancy} onChange={handleChange} />
            <OutlinedInput label="Caução" name="deposit" value={formData.deposit} onChange={handleChange} />
            <OutlinedInput label="Máx. Ocupantes" name="maxOccupants" value={formData.maxOccupants} onChange={handleChange} />
          </div>
        </section>

        {/* SEÇÃO 3: TOGGLES */}
        <section className="toggles-section">
          <div className="toggles-card">
            <h3 className="toggles-subtitle">O que o imóvel oferece</h3>
            <div className="toggles-list">
              <CustomToggle label="Água" name="hasAgua" checked={formData.hasAgua} onChange={handleChange} />
              <CustomToggle label="Luz" name="hasLuz" checked={formData.hasLuz} onChange={handleChange} />
              <CustomToggle label="IPTU" name="hasIPTU" checked={formData.hasIPTU} onChange={handleChange} />
              <CustomToggle label="Gás" name="hasGas" checked={formData.hasGas} onChange={handleChange} />
              <CustomToggle label="Internet" name="hasInternet" checked={formData.hasInternet} onChange={handleChange} />
              <CustomToggle label="Condomínio" name="hasCondominio" checked={formData.hasCondominio} onChange={handleChange} />
            </div>
          </div>
          <div className="toggles-card border-left">
            <h3 className="toggles-subtitle">Infraestrutura e Regras</h3>
            <div className="toggles-list-2-cols">
              <div className="toggles-col">
                <CustomToggle label="Garagem" name="hasGaragem" checked={formData.hasGaragem} onChange={handleChange} />
                <CustomToggle label="Animais" name="hasAnimais" checked={formData.hasAnimais} onChange={handleChange} />
                <CustomToggle label="Fumantes" name="hasFumantes" checked={formData.hasFumantes} onChange={handleChange} />
                <CustomToggle label="Mobiliado" name="hasMobiliado" checked={formData.hasMobiliado} onChange={handleChange} />
              </div>
              <div className="toggles-col">
                <CustomToggle label="Churrasqueira" name="hasChurrasqueira" checked={formData.hasChurrasqueira} onChange={handleChange} />
                <CustomToggle label="Elevador" name="hasElevador" checked={formData.hasElevador} onChange={handleChange} />
                <CustomToggle label="Segurança" name="hasPortaria" checked={formData.hasPortaria} onChange={handleChange} />
              </div>
            </div>
          </div>
        </section>

        <section className="media-desc-section">
          <div className="media-col">
            <CustomToggle label="Visita Virtual" name="hasVisitaVirtual" checked={formData.hasVisitaVirtual} onChange={handleChange} />
            <div className="mt-4"><OutlinedInput label="YouTube Link" name="youtubeLink" value={formData.youtubeLink} onChange={handleChange} /></div>
          </div>
          <div className="desc-col">
            <label className="outlined-label">Descrição</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="outlined-field textarea-field" />
          </div>
        </section>

        <div className="footer-actions">
          <button className="btn-save-unified" onClick={handleUpdate} disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
        </div>

      </div>

      <SuccessModal isOpen={isModalOpen} isEditing={true} onClose={() => router.push('/ads/my-properties')} />
    </main>
  );
}