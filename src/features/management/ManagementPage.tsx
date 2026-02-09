"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import { PropertyManagement } from "./components/PropertyManagement";
import { UserManagement } from "./components/UserManagement";
import * as S from "./styles";

export default function GerenciamentoPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("imoveis");

    const canSeeUsers = user?.role === "ADMIN";
    const canSeeProperties = ["ADMIN", "REALTOR", "OWNER"].includes(user?.role || "");

    return (
        <S.PageContainer>
            <S.TitleSection>
                <h1>Painel de Gerenciamento</h1>
                <p>Perfil atual: <strong>{user?.role}</strong></p>
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
            </S.TabsContainer>

            <S.ContentSection>
                {activeTab === "imoveis" && (
                    <PropertyManagement userId={user?.id} userRole={user?.role} />
                )}

                {activeTab === "usuarios" && (
                    <UserManagement />
                )}
            </S.ContentSection>
        </S.PageContainer>
    );
}