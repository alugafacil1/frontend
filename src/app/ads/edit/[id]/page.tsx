"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/lib/auth/useAuth";
import { propertyService } from "@/services/property/propertyService";
import { SuccessModal } from "@/components/SuccessModal";
import "@/assets/styles/ads/EditAdUnified.css"; 

// --- SEUS HOOKS ---
import { useCep } from "../../../../../hooks/useCep"; 
import { useLocation } from "../../../../../hooks/useLocation"; 
import { useMasks } from "../../../../../hooks/useMasks";
import { useGeolocation } from "../../../../../hooks/useGeolocation"; // O hook que criamos no passo anterior

// ============================================================================
// 1. COMPONENTES EXTRAÍDOS (Fora da função principal para não perder o foco)
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

  // --- ESTADO UNIFICADO ---
  const [formData, setFormData] = useState<any>({
    country: 'Brazil', 
    cep: '', number: '', rooms: '', city: '', propertyType: '', address: '', bathrooms: '',
    monthlyRent: '', weeklyRent: '', availableFrom: '', minTenancy: '', deposit: '', maxOccupants: '',
    hasAgua: false, hasLuz: false, hasIPTU: false, hasGas: false, hasInternet: false, hasCondominio: false,
    hasGaragem: false, hasAnimais: false, hasFumantes: false, hasSacada: false, hasMobiliado: false, hasArCondicionado: false,
    hasChurrasqueira: false, hasElevador: false, hasPortaria: false,
    hasVisitaVirtual: false, youtubeLink: '', description: '', images: []
  });

  // --- INICIANDO HOOKS ---
  const { fetchAddress, maskCep: cepMasker } = useCep(); 
  const { countries, cities, loadingCities } = useLocation(formData.country); 
  const { maskCurrency, maskNumber, unmaskCurrency } = useMasks();
  const { fetchCoordinates } = useGeolocation();

  // --- CARREGAMENTO DO IMÓVEL (API) ---
  useEffect(() => {
    async function loadProperty() {
      if (!propertyId || propertyId === 'undefined') return;

      try {
        const data = await propertyService.getById(propertyId);
        
        if (user && data.userId && user.id !== data.userId) {
          alert("Sem permissão para editar este anúncio.");
          router.push("/ads/my-properties"); 
          return;
        }

        const formatCurrencyFromBackend = (cents: number) => cents ? (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "";
        const checkAmenity = (term: string) => data.amenities?.some((a: string) => a.toLowerCase().includes(term.toLowerCase()));
        const checkRule = (term: string) => data.houseRules?.some((r: string) => r.toLowerCase().includes(term.toLowerCase()));

        const initialCountry = (data.address?.state === 'Brasil' || !data.address?.state) ? 'Brazil' : data.address.state;

        setFormData((prev: any) => ({
          ...prev,
          country: initialCountry, 
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
          images: data.photoUrls || []
        }));

      } catch (error) {
        console.error("Erro ao carregar:", error);
      } finally {
        setFetching(false);
      }
    }
    if (user && propertyId) loadProperty();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, user, router]);

  // --- HANDLERS (INPUTS E MÁSCARAS) ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: any) => ({ ...prev, [name]: checked }));
    } else if (name === 'monthlyRent' || name === 'weeklyRent' || name === 'deposit') {
      setFormData((prev: any) => ({ ...prev, [name]: maskCurrency(value) }));
    } else if (name === 'rooms' || name === 'bathrooms' || name === 'minTenancy' || name === 'maxOccupants') {
      setFormData((prev: any) => ({ ...prev, [name]: maskNumber(value) }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = cepMasker(e.target.value);
    setFormData((prev: any) => ({ ...prev, cep: maskedValue }));
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
          country: addressData.uf === 'BR' ? 'Brazil' : 'Brazil', 
        }));
      }
    }
  };


  // --- SUBMIT
  const handleUpdate = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault(); // Evita recarregamento acidental da página
    setIsSubmitting(true);
    
    try {
      // 1. Gera os Arrays baseados nos Toggles
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

      // 2. Busca Latitude e Longitude (Nominatim API)
      const fullAddressQuery = `${formData.address}, ${formData.number}, ${formData.city}, ${stateForBackend}`;
      const coords = await fetchCoordinates(fullAddressQuery);

      // 3. Monta o Payload para a API
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

      // 4. Salva os dados no banco
      await propertyService.update(propertyId, payload);

      // 5. Salva novas fotos (se o usuário tiver adicionado na edição)
      const newImages = formData.images.filter((img: any) => img instanceof File);
      if (newImages.length > 0) {
        await propertyService.uploadPhotos(propertyId, newImages);
      }

      // 6. Rola a tela para o topo suavemente
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // 7. Abre o Modal Bonitinho
      setIsModalOpen(true);

    } catch (error) {
      console.error("Erro ao salvar o imóvel:", error);
      // Aqui mantemos o alert normal só para caso dê um erro real na API
      alert("Erro ao atualizar anúncio. Verifique se todos os campos obrigatórios estão preenchidos.");
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
            <button className="btn-add-img"><PlusIcon className="w-5 h-5" /></button>
          </div>
          <div className="image-gallery-grid">
            {formData.images.slice(0,4).map((img: string, i: number) => (
              <div key={i} className="gallery-img-box">
                <img src={img} alt={`Foto ${i}`} />
                {i === 0 && <button className="gallery-nav left"><ChevronLeftIcon className="w-4 h-4"/></button>}
                {i === 3 && <button className="gallery-nav right"><ChevronRightIcon className="w-4 h-4"/></button>}
              </div>
            ))}
            {formData.images.length === 0 && (
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
              <select name="country" value={formData.country} onChange={handleChange} className="outlined-field select-with-flag">
                {countries.length > 0 ? (
                  countries.map((c: any) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))
                ) : (
                  <option value="Brazil">Brasil 🇧🇷</option> 
                )}
              </select>
            </div>

            <OutlinedInput 
              label="CEP" name="cep" value={formData.cep} onChange={handleCepChange} onBlur={handleCepBlur} placeholder="Digite o CEP" maxLength={9}
            />
            
            <OutlinedInput label="Número da Casa/Apto" name="number" value={formData.number} onChange={handleChange} placeholder="Digite o Número" />
            <OutlinedInput label="Número de Quartos" name="rooms" value={formData.rooms} onChange={handleChange} placeholder="Digite o número de quartos" />
            
            <div className="outlined-input-wrapper">
              <label className="outlined-label">Selecione a Cidade</label>
              <select name="city" value={formData.city} onChange={handleChange} className="outlined-field" disabled={loadingCities}>
                <option value="" disabled>{loadingCities ? 'Carregando...' : 'Selecione a cidade'}</option>
                {cities && cities.length > 0 ? (
                  cities.map((city: any, idx: number) => (
                    <option key={idx} value={city.value}>{city.label}</option>
                  ))
                ) : (
                  <option value={formData.city}>{formData.city || "Nenhuma cidade carregada"}</option>
                )}
              </select>
            </div>
            
            <div className="outlined-input-wrapper">
              <label className="outlined-label">Tipo de Imóvel</label>
              <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="outlined-field">
                <option value="APARTMENT">Apartamento</option>
                <option value="HOUSE">Casa</option>
                <option value="ROOM">Quarto</option>
              </select>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <OutlinedInput label="Endereço" name="address" value={formData.address} onChange={handleChange} placeholder="Digite o endereço" />
            </div>
            <OutlinedInput label="Número de Banheiros" name="bathrooms" value={formData.bathrooms} onChange={handleChange} placeholder="Digite o número" />
          </div>

          <hr className="section-divider" />

          <div className="form-grid-3">
            <OutlinedInput label="Aluguel Mensal" name="monthlyRent" value={formData.monthlyRent} onChange={handleChange} placeholder="Digite o valor" />
            <OutlinedInput label="Aluguel Semanal" name="weeklyRent" value={formData.weeklyRent} onChange={handleChange} placeholder="Digite o valor" />
            <OutlinedInput label="Disponível a partir de" name="availableFrom" value={formData.availableFrom} onChange={handleChange} type="date" icon={CalendarIcon} />
            
            <OutlinedInput label="Tempo Mínimo de Contrato" name="minTenancy" value={formData.minTenancy} onChange={handleChange} placeholder="Digite" />
            <OutlinedInput label="Valor da Caução" name="deposit" value={formData.deposit} onChange={handleChange} placeholder="Digite o valor" />
            <OutlinedInput label="Nº Máximo de Ocupantes" name="maxOccupants" value={formData.maxOccupants} onChange={handleChange} placeholder="Digite" />
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
            <h3 className="toggles-subtitle">O que já está pago no valor mensal</h3>
            <div className="toggles-list-2-cols">
              <div className="toggles-col">
                <CustomToggle label="Vaga de Garagem" name="hasGaragem" checked={formData.hasGaragem} onChange={handleChange} />
                <CustomToggle label="Aceita Animais" name="hasAnimais" checked={formData.hasAnimais} onChange={handleChange} />
                <CustomToggle label="Aceita Fumantes" name="hasFumantes" checked={formData.hasFumantes} onChange={handleChange} />
                <CustomToggle label="Sacada / Varanda" name="hasSacada" checked={formData.hasSacada} onChange={handleChange} />
                <CustomToggle label="Mobiliado" name="hasMobiliado" checked={formData.hasMobiliado} onChange={handleChange} />
                <CustomToggle label="Ar-condicionado" name="hasArCondicionado" checked={formData.hasArCondicionado} onChange={handleChange} />
              </div>
              <div className="toggles-col">
                <CustomToggle label="Churrasqueira" name="hasChurrasqueira" checked={formData.hasChurrasqueira} onChange={handleChange} />
                <CustomToggle label="Elevador" name="hasElevador" checked={formData.hasElevador} onChange={handleChange} />
                <CustomToggle label="Portaria / Segurança" name="hasPortaria" checked={formData.hasPortaria} onChange={handleChange} />
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 4: VISITA E DESCRIÇÃO */}
        <section className="media-desc-section">
          <div className="media-col">
            <CustomToggle label="Visita Virtual" name="hasVisitaVirtual" checked={formData.hasVisitaVirtual} onChange={handleChange} />
            <div className="mt-4">
              <OutlinedInput label="Link do YouTube (Opcional)" name="youtubeLink" value={formData.youtubeLink} onChange={handleChange} placeholder="Cole o link" />
            </div>
          </div>
          <div className="desc-col">
            <div className="outlined-input-wrapper h-full">
              <label className="outlined-label">Descrição da Disponibilidade</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                className="outlined-field textarea-field"
              />
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <div className="footer-actions">
          <button 
            className="btn-save-unified"
            onClick={handleUpdate}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
        </div>

      </div>

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