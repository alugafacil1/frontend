"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import { PropertyManagement } from "./components/PropertyManagement";
import { UserManagement } from "./components/UserManagement";
import * as S from "./styles";
import Header from "@/components/Header";
import { AgencyManagement } from "./components/AgencyManagement";
import { RealtorManagement } from "./components/RealtorManagement"; 
import { RegisterRealtorModal } from "./components/RegisterRealtorModal";
import { translateRole } from "@/utils/translateRoles";

export default function GerenciamentoPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("imoveis");
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    const canSeeUsers = user?.role === "ADMIN";
    const canSeeProperties = ["ADMIN", "REALTOR", "OWNER", "AGENCY_ADMIN"].includes(user?.role || "");
    const canSeeAgencies = user?.role === "ADMIN";
    const canSeeRealtors = ["ADMIN", "AGENCY_ADMIN"].includes(user?.role || "");

    return (
        <S.PageContainer>
            <Header />
            <S.TitleSection>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div>
                        <h1>Painel de Gerenciamento</h1>
                        <p>Perfil atual: <strong>{translateRole(user?.role)}</strong></p>
                    </div>

                    {activeTab === "corretores" && (
                        <button
                            onClick={() => setIsRegisterModalOpen(true)}
                            style={{
                                backgroundColor: '#515DEF',
                                color: 'white',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: 'none',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                        >
                            <span style={{ fontSize: '20px', lineHeight: '1' }}>+</span> 
                            Add novo Agente
                        </button>
                    )}
                </div>
            </S.TitleSection>

            <S.TabsContainer>
                {canSeeUsers && (
                    <S.TabButton $active={activeTab === "usuarios"} onClick={() => setActiveTab("usuarios")}>
                        Usuários
                    </S.TabButton>
                )}
                {canSeeProperties && (
                    <S.TabButton $active={activeTab === "imoveis"} onClick={() => setActiveTab("imoveis")}>
                        Imóveis
                    </S.TabButton>
                )}
                {canSeeAgencies && (
                    <S.TabButton $active={activeTab === "agencias"} onClick={() => setActiveTab("agencias")}>
                        Agências
                    </S.TabButton>
                )}
                {canSeeRealtors && (
                    <S.TabButton $active={activeTab === "corretores"} onClick={() => setActiveTab("corretores")}>
                        Corretores
                    </S.TabButton>
                )}
            </S.TabsContainer>

            <S.ContentSection>
                {activeTab === "imoveis" && (
                    <PropertyManagement userId={user?.id} userRole={user?.role} />
                )}

                {activeTab === "usuarios" && (
                    <UserManagement />
                )}

                {activeTab === "agencias" && (
                    <AgencyManagement />
                )}

                {activeTab === "corretores" && (
                    <RealtorManagement agencyId={user?.agencyId} /> 
                )}
            </S.ContentSection>

            <RegisterRealtorModal 
                isOpen={isRegisterModalOpen} 
                onClose={() => setIsRegisterModalOpen(false)} 
            />
        </S.PageContainer>
    );
}