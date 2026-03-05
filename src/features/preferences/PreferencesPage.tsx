"use client";

import { useAuth } from "@/lib/auth/useAuth";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "@/assets/styles/preferences/index.css";
import { useToast } from "@/components/ToastContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FloatingInput } from "@/components/FloatingInput";
import { BaseModal, ModalBody } from "@/components/Modal/Modal";

interface UserPreferences {
  id?: string;
  preferenceId?: string;
  name: string;
  maxPriceInCents: number;
  minBedrooms: number;
  minBathrooms: number | null;
  petFriendly: boolean;
  furnished: boolean;
  city: string;
  neighborhood: string;
  searchRadiusInMeters: number;
  garageCount: number;
  searchCenter: {
    latitude: number;
    longitude: number;
  };
  userId: string;
}

export default function PreferencesPage() {
  const { user: authUser, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const { data: preferencesList, isLoading, isError } = useQuery<UserPreferences[]>({
    queryKey: ['userPreferences', authUser?.id],
    queryFn: async () => {
      if (typeof window === 'undefined') return [];
      
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage");
        return [];
      }
      
      try {
        // Busca preferências do usuário usando query parameter
        const res = await fetch(`http://localhost:8081/api/preferences?idUser=${authUser?.id}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        if (res.status === 404) {
          // Usuário ainda não tem preferências - isso é normal
          return [];
        }
        
        if (!res.ok) {
          if (res.status === 401) {
            // Token inválido ou expirado
            console.error("401 Unauthorized - Token inválido ou expirado");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            if (typeof window !== 'undefined') {
              router.push("/login");
            }
            throw new Error("401");
          }
          const errorText = await res.text();
          console.error(`Erro ao carregar preferências: ${res.status} - ${errorText}`);
          throw new Error(`Erro ao carregar preferências: ${res.status}`);
        }
        
        const data = await res.json();
        // Retorna array de preferências
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching preferences:", error);
        if (error instanceof Error && error.message === "401") {
          throw error; // Re-throw para que o React Query trate adequadamente
        }
        // Retorna array vazio em caso de outros erros para permitir que o usuário crie preferências
        return [];
      }
    },
    enabled: !!authUser?.id && typeof window !== 'undefined' && !authLoading,
    retry: (failureCount, error) => {
      // Não tenta novamente se for erro 401
      if (error instanceof Error && error.message === "401") {
        return false;
      }
      return failureCount < 2;
    },
  });

  const [selectedPreferenceId, setSelectedPreferenceId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [preferenceToDelete, setPreferenceToDelete] = useState<{ id: string; name: string } | null>(null);

  // Query para buscar detalhes de uma preferência específica
  const { data: preferenceDetails, isLoading: isLoadingDetails, error: preferenceDetailsError } = useQuery<UserPreferences>({
    queryKey: ['preferenceDetails', selectedPreferenceId],
    queryFn: async () => {
      if (typeof window === 'undefined' || !selectedPreferenceId) {
        throw new Error("No preference ID");
      }
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token");
      }
      
      console.log("Buscando detalhes da preferência:", selectedPreferenceId);
      
      const res = await fetch(`http://localhost:8081/api/preferences/${selectedPreferenceId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
          throw new Error("401");
        }
        const errorText = await res.text();
        console.error("Erro ao buscar detalhes:", res.status, errorText);
        throw new Error(`Erro ao carregar detalhes da preferência: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Detalhes recebidos:", data);
      return data;
    },
    enabled: !!selectedPreferenceId && typeof window !== 'undefined' && !isCreatingNew,
    retry: false,
    staleTime: 0, // Sempre busca dados frescos
  });

  // Helper para obter o ID da preferência (pode ser id ou preferenceId)
  const getPreferenceId = (pref: UserPreferences): string | undefined => {
    return pref.preferenceId || pref.id;
  };

  // Preferência selecionada para edição (prioriza os detalhes da API, senão usa da lista)
  const selectedPreference = preferenceDetails || preferencesList?.find(p => {
    const prefId = getPreferenceId(p);
    return prefId === selectedPreferenceId;
  }) || null;

  const [formData, setFormData] = useState<Partial<UserPreferences>>({
    name: "",
    maxPriceInCents: 0,
    minBedrooms: 0,
    minBathrooms: null,
    petFriendly: false,
    furnished: false,
    city: "",
    neighborhood: "",
    searchRadiusInMeters: 5000,
    garageCount: 0,
    searchCenter: {
      latitude: 0,
      longitude: 0,
    },
    userId: authUser?.id || "",
  });

  // Atualiza formData quando uma preferência é selecionada ou quando os detalhes são carregados
  useEffect(() => {
    // Se estamos editando e temos uma preferência selecionada
    if (selectedPreferenceId && !isCreatingNew) {
      // Se temos os detalhes da API, usa eles (mais completos)
      if (preferenceDetails) {
        setFormData({
          ...preferenceDetails,
          userId: authUser?.id || "",
        });
      } 
      // Se ainda não temos os detalhes mas temos na lista, usa temporariamente
      else if (preferencesList) {
        const prefFromList = preferencesList.find(p => {
          const prefId = getPreferenceId(p);
          return prefId === selectedPreferenceId;
        });
        if (prefFromList) {
          setFormData({
            ...prefFromList,
            userId: authUser?.id || "",
          });
        }
      }
    } 
    // Se estamos criando nova preferência
    else if (isCreatingNew) {
      setFormData({
        name: "",
        maxPriceInCents: 0,
        minBedrooms: 0,
        minBathrooms: null,
        petFriendly: false,
        furnished: false,
        city: "",
        neighborhood: "",
        searchRadiusInMeters: 5000,
        garageCount: 0,
        searchCenter: {
          latitude: 0,
          longitude: 0,
        },
        userId: authUser?.id || "",
      });
    }
  }, [preferenceDetails, selectedPreferenceId, isCreatingNew, preferencesList, authUser?.id]);

  const handleSelectPreference = (preferenceId: string | null) => {
    setSelectedPreferenceId(preferenceId);
    setIsCreatingNew(false);
  };

  const handleEditPreference = (preferenceId: string, e?: React.MouseEvent) => {
    console.log("handleEditPreference chamado com:", preferenceId);
    
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    if (!preferenceId) {
      console.error("preferenceId é inválido:", preferenceId);
      return;
    }
    
    console.log("Editando preferência:", preferenceId);
    console.log("Estado atual - selectedPreferenceId:", selectedPreferenceId, "isCreatingNew:", isCreatingNew);
    
    // Limpa o estado de criação e define o ID para edição
    setIsCreatingNew(false);
    setSelectedPreferenceId(preferenceId);
    
    console.log("Estado atualizado - selectedPreferenceId será:", preferenceId);
    
    // Scroll para o formulário após um pequeno delay para garantir que foi renderizado
    setTimeout(() => {
      console.log("Verificando se formulário foi renderizado...");
      const formElement = document.querySelector('.preferences-form');
      if (formElement) {
        console.log("Formulário encontrado, fazendo scroll");
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        console.log("Formulário não encontrado ainda, fazendo scroll para o topo");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleCreateNew = () => {
    setSelectedPreferenceId(null);
    setIsCreatingNew(true);
    setFormData({
      name: "",
      maxPriceInCents: 0,
      minBedrooms: 0,
      minBathrooms: null,
      petFriendly: false,
      furnished: false,
      city: "",
      neighborhood: "",
      searchRadiusInMeters: 5000,
      garageCount: 0,
      searchCenter: {
        latitude: 0,
        longitude: 0,
      },
      userId: authUser?.id || "",
    });
  };

  const handleCancelEdit = () => {
    setSelectedPreferenceId(null);
    setIsCreatingNew(false);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (typeof window === 'undefined') throw new Error("Sessão inválida");
      
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        throw new Error("Sessão inválida");
      }

      const payload = {
        name: formData.name,
        maxPriceInCents: formData.maxPriceInCents ? Number(formData.maxPriceInCents) : 0,
        minBedrooms: formData.minBedrooms ? Number(formData.minBedrooms) : 0,
        minBathrooms: formData.minBathrooms ? Number(formData.minBathrooms) : null,
        petFriendly: formData.petFriendly || false,
        furnished: formData.furnished || false,
        city: formData.city || "",
        neighborhood: formData.neighborhood || "",
        searchRadiusInMeters: formData.searchRadiusInMeters ? Number(formData.searchRadiusInMeters) : 5000,
        garageCount: formData.garageCount ? Number(formData.garageCount) : 0,
        searchCenter: formData.searchCenter || { latitude: 0, longitude: 0 },
        userId: authUser?.id,
      };

      const selectedId = selectedPreference ? getPreferenceId(selectedPreference) : null;
      const url = selectedId 
        ? `http://localhost:8081/api/preferences/${selectedId}`
        : `http://localhost:8081/api/preferences`;

      const method = selectedId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
          throw new Error("Sessão expirada. Por favor, faça login novamente.");
        }
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao salvar preferências");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
      queryClient.invalidateQueries({ queryKey: ['preferenceDetails'] });
      addToast("Preferências salvas com sucesso!", "success");
      // Volta para a lista após salvar
      setSelectedPreferenceId(null);
      setIsCreatingNew(false);
    },
    onError: (error: Error) => {
      addToast(error.message || "Falha ao salvar preferências.", "error");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (preferenceId: string) => {
      if (typeof window === 'undefined' || !preferenceId) throw new Error("Sessão inválida");
      
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        throw new Error("Sessão inválida");
      }

      const res = await fetch(`http://localhost:8081/api/preferences/${preferenceId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
          throw new Error("Sessão expirada. Por favor, faça login novamente.");
        }
        throw new Error("Erro ao deletar preferências");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
      queryClient.invalidateQueries({ queryKey: ['preferenceDetails'] });
      // Se deletou a preferência selecionada, limpa a seleção
      if (selectedPreferenceId) {
        setSelectedPreferenceId(null);
        setIsCreatingNew(false);
      }
      setDeleteModalOpen(false);
      setPreferenceToDelete(null);
      addToast("Preferência deletada com sucesso!", "success");
    },
    onError: () => {
      addToast("Falha ao deletar preferência.", "error");
    }
  });

  const handleInputChange = (field: keyof UserPreferences, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (field: keyof UserPreferences, nestedField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...(prev[field] as any),
        [nestedField]: value
      }
    }));
  };

  const formatCurrency = (value: number) => {
    if (!value || value === 0) return "";
    const valueInReais = value / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valueInReais);
  };

  const parseCurrency = (value: string) => {
    const cleaned = value.replace(/[^\d]/g, '');
    return cleaned ? parseInt(cleaned) : 0;
  };

  const formatPreferenceSummary = (pref: UserPreferences) => {
    const parts = [];
    if (pref.city) parts.push(pref.city);
    if (pref.neighborhood) parts.push(pref.neighborhood);
    if (pref.maxPriceInCents > 0) parts.push(`Até ${formatCurrency(pref.maxPriceInCents)}`);
    if (pref.minBedrooms > 0) parts.push(`${pref.minBedrooms}+ quartos`);
    
    return parts.length > 0 ? parts.join(" • ") : "Sem detalhes";
  };

  if (authLoading || isLoading) {
    return (
      <div id="preferences-wrapper">
        <Header />
        <div className="flex h-screen items-center justify-center">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // Se houver erro mas não for 401, ainda permite que o usuário crie preferências
  // O erro 401 já foi tratado dentro do queryFn e redireciona para login

  const showForm = selectedPreferenceId !== null || isCreatingNew;

  return (
    <div id="preferences-wrapper">
      <Header />
      <main>
        <div className="preferences-container">
          <div className="preferences-card">
            <div className="preferences-header">
              <h1 className="preferences-title">Preferências de Busca</h1>
              <p className="preferences-subtitle">
                Configure suas preferências para encontrar o imóvel ideal
              </p>
            </div>

            {!showForm && (
              <div className="preferences-list-section">
                <div className="list-header">
                  <h2 className="list-title">Suas Preferências</h2>
                  <button onClick={handleCreateNew} className="btn-create-new">
                    + Nova Preferência
                  </button>
                </div>

                {preferencesList && preferencesList.length > 0 ? (
                  <div className="preferences-list">
                    {preferencesList.map((pref, index) => {
                      const prefId = getPreferenceId(pref);
                      return (
                      <div 
                        key={prefId || `pref-${index}`}
                        className="preference-card"
                      >
                        <div className="preference-card-content">
                          <h3 className="preference-card-title">{pref.name || "Sem nome"}</h3>
                          <p className="preference-card-summary">{formatPreferenceSummary(pref)}</p>
                          <div className="preference-card-badges">
                            {pref.petFriendly && <span key={`${prefId || index}-pet`} className="badge">Aceita Animais</span>}
                            {pref.furnished && <span key={`${prefId || index}-furnished`} className="badge">Mobiliado</span>}
                            {pref.minBedrooms > 0 && <span key={`${prefId || index}-bedrooms`} className="badge">{pref.minBedrooms}+ Quartos</span>}
                            {pref.garageCount > 0 && <span key={`${prefId || index}-garage`} className="badge">{pref.garageCount} Vagas</span>}
                          </div>
                        </div>
                        <div className="preference-card-actions">
                          <button
                            className="preference-card-edit"
                            onClick={(e) => {
                              console.log("Botão de editar clicado!", prefId);
                              e.stopPropagation();
                              e.preventDefault();
                              if (prefId) {
                                console.log("Chamando handleEditPreference com ID:", prefId);
                                handleEditPreference(prefId, e);
                              } else {
                                console.error("prefId não existe:", pref);
                              }
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                            }}
                            title="Editar preferência"
                            type="button"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                            </svg>
                          </button>
                          <button
                            className="preference-card-delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              if (prefId) {
                                setPreferenceToDelete({ id: prefId, name: pref.name || "Sem nome" });
                                setDeleteModalOpen(true);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                            title="Deletar preferência"
                            type="button"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p className="empty-state-text">Você ainda não tem preferências cadastradas.</p>
                    <button onClick={handleCreateNew} className="btn-create-first">
                      Criar Primeira Preferência
                    </button>
                  </div>
                )}
              </div>
            )}

            {showForm && (
              <div className="preferences-form">
                <div className="form-header">
                  <h2 className="form-title">
                    {isCreatingNew ? "Nova Preferência" : "Editar Preferência"}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isLoadingDetails && selectedPreferenceId && (
                      <span className="loading-indicator">Carregando detalhes...</span>
                    )}
                    {preferenceDetailsError && (
                      <span style={{ color: '#ef4444', fontSize: '14px' }}>
                        Erro ao carregar detalhes. Usando dados da lista.
                      </span>
                    )}
                    <button onClick={handleCancelEdit} className="btn-cancel-edit">
                      Voltar para lista
                    </button>
                  </div>
                </div>
              <div className="section-title">Informações Básicas</div>
              
              <div className="form-grid">
                <div className="form-group">
                  <FloatingInput
                    label="Nome da Busca"
                    placeholder="Ex: Busca Recife Boa Viagem"
                    value={formData.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <FloatingInput
                    label="Cidade"
                    placeholder="Ex: Recife"
                    value={formData.city || ""}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <FloatingInput
                    label="Bairro"
                    placeholder="Ex: Boa Viagem"
                    value={formData.neighborhood || ""}
                    onChange={(e) => handleInputChange("neighborhood", e.target.value)}
                  />
                </div>
              </div>

              <div className="section-title">Preço e Características</div>

              <div className="form-grid">
                <div className="form-group">
                  <FloatingInput
                    label="Preço Máximo (R$)"
                    type="text"
                    placeholder="Ex: R$ 3.000,00"
                    value={formData.maxPriceInCents ? formatCurrency(formData.maxPriceInCents) : ""}
                    onChange={(e) => {
                      const parsed = parseCurrency(e.target.value);
                      handleInputChange("maxPriceInCents", parsed);
                    }}
                  />
                </div>

                <div className="form-group">
                  <FloatingInput
                    label="Quartos Mínimos"
                    type="number"
                    min="0"
                    placeholder="Ex: 2"
                    value={formData.minBedrooms || ""}
                    onChange={(e) => handleInputChange("minBedrooms", parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="form-group">
                  <FloatingInput
                    label="Banheiros Mínimos"
                    type="number"
                    min="0"
                    placeholder="Ex: 1"
                    value={formData.minBathrooms || ""}
                    onChange={(e) => handleInputChange("minBathrooms", e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>

                <div className="form-group">
                  <FloatingInput
                    label="Vagas de Garagem"
                    type="number"
                    min="0"
                    placeholder="Ex: 1"
                    value={formData.garageCount || ""}
                    onChange={(e) => handleInputChange("garageCount", parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="form-group">
                  <FloatingInput
                    label="Raio de Busca (metros)"
                    type="number"
                    min="0"
                    placeholder="Ex: 5000"
                    value={formData.searchRadiusInMeters || ""}
                    onChange={(e) => handleInputChange("searchRadiusInMeters", parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="section-title">Localização</div>

              <div className="form-grid">
                <div className="form-group">
                  <FloatingInput
                    label="Latitude"
                    type="number"
                    step="any"
                    placeholder="Ex: -8.1193"
                    value={formData.searchCenter?.latitude || ""}
                    onChange={(e) => handleNestedChange("searchCenter", "latitude", parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="form-group">
                  <FloatingInput
                    label="Longitude"
                    type="number"
                    step="any"
                    placeholder="Ex: -34.9062"
                    value={formData.searchCenter?.longitude || ""}
                    onChange={(e) => handleNestedChange("searchCenter", "longitude", parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="section-title">Preferências</div>

              <div className="boolean-preferences">
                <div 
                  className={`preference-row ${formData.petFriendly ? 'selected' : ''}`}
                  onClick={() => handleInputChange("petFriendly", !formData.petFriendly)}
                >
                  <span className="preference-name">Aceita Animais</span>
                  <div className={`toggle-switch ${formData.petFriendly ? 'active' : ''}`}>
                    <div className="toggle-thumb"></div>
                  </div>
                </div>

                <div 
                  className={`preference-row ${formData.furnished ? 'selected' : ''}`}
                  onClick={() => handleInputChange("furnished", !formData.furnished)}
                >
                  <span className="preference-name">Mobiliado</span>
                  <div className={`toggle-switch ${formData.furnished ? 'active' : ''}`}>
                    <div className="toggle-thumb"></div>
                  </div>
                </div>
              </div>

                <div className="form-actions">
                  {selectedPreference && getPreferenceId(selectedPreference) && (
                    <button
                      onClick={() => {
                        const prefId = getPreferenceId(selectedPreference);
                        if (prefId) {
                          setPreferenceToDelete({ 
                            id: prefId, 
                            name: selectedPreference.name || "Sem nome" 
                          });
                          setDeleteModalOpen(true);
                        }
                      }}
                      className="btn-delete"
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? "Deletando..." : "Deletar"}
                    </button>
                  )}
                  <div className="form-actions-right">
                    <button
                      onClick={handleCancelEdit}
                      className="btn-cancel"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => saveMutation.mutate()}
                      className="btn-save"
                      disabled={saveMutation.isPending}
                    >
                      {saveMutation.isPending ? "Salvando..." : isCreatingNew ? "Criar Preferência" : "Salvar Alterações"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Confirmação de Deleção */}
      {deleteModalOpen && (
        <BaseModal
          isOpen={deleteModalOpen}
          onRequestClose={() => {
            setDeleteModalOpen(false);
            setPreferenceToDelete(null);
          }}
          title="Atenção: Deletar Preferência"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', width: '100%' }}>
              <button 
                onClick={() => {
                  setDeleteModalOpen(false);
                  setPreferenceToDelete(null);
                }} 
                disabled={deleteMutation.isPending}
                style={{ 
                  padding: '8px 16px', 
                  background: 'none', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  fontWeight: 600, 
                  cursor: deleteMutation.isPending ? 'not-allowed' : 'pointer', 
                  color: '#374151',
                  opacity: deleteMutation.isPending ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  if (preferenceToDelete?.id) {
                    deleteMutation.mutate(preferenceToDelete.id);
                  }
                }} 
                disabled={deleteMutation.isPending}
                style={{ 
                  padding: '8px 16px', 
                  background: '#dc2626', 
                  border: 'none', 
                  borderRadius: '6px', 
                  fontWeight: 600, 
                  cursor: deleteMutation.isPending ? 'not-allowed' : 'pointer', 
                  color: 'white',
                  opacity: deleteMutation.isPending ? 0.6 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {deleteMutation.isPending ? 'Deletando...' : 'Deletar'}
              </button>
            </div>
          }
        >
          <ModalBody>
            <div style={{ padding: '1rem 0', color: '#374151', fontSize: '1rem', lineHeight: '1.5' }}>
              Tem certeza que deseja deletar a preferência <strong>"{preferenceToDelete?.name}"</strong>?
              <br /><br />
              <span style={{ color: '#dc2626', fontSize: '0.9rem' }}>
                ⚠️ Esta ação não pode ser desfeita.
              </span>
            </div>
          </ModalBody>
        </BaseModal>
      )}
    </div>
  );
}
