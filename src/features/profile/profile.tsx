"use client";

import { useAuth } from "@/lib/auth/useAuth";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import "@/assets/styles/profile/index.css";
import { useToast } from "@/components/ToastContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface UserProfileData {
  id?: string;
  userId?: string;
  name: string;
  email: string;
  phoneNumber?: string;
  cpf?: string;
  photoUrl?: string;
  userType?: string;
}

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
);

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
);

function cleanDigits(value: string | undefined | null) {
  return (value || "").replace(/\D/g, "");
}

function formatCPF(value: string | undefined | null) {
  const v = cleanDigits(value);
  if (!v) return "";
  const safeValue = v.substring(0, 11);
  return safeValue
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatPhone(value: string | undefined | null) {
  const v = cleanDigits(value);
  if (!v) return "";
  const safeValue = v.substring(0, 11);
  if (safeValue.length === 11) {
      return safeValue.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (safeValue.length === 10) {
      return safeValue.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return safeValue; 
}

function translateRole(role?: string) {
  if (!role) return "Usuário";
  const roles: Record<string, string> = { ADMIN: "Administrador", TENANT: "Inquilino", OWNER: "Proprietário", REALTOR: "Corretor" };
  return roles[role] || role;
}

const formGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  marginBottom: '16px',
  position: 'relative',
  width: '100%'
};

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: '4px',
  position: 'static',
  zIndex: 10
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "48px",
  padding: "0 16px",
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  color: "#000000",
  fontSize: "16px",
  fontFamily: "inherit",
  boxSizing: "border-box",
  outline: "none",
  margin: 0,
  display: "block",
  position: "relative",
  zIndex: 5
};

const disabledInputStyle: React.CSSProperties = {
  ...inputStyle,
  backgroundColor: "#f3f4f6",
  color: "#6b7280",
  cursor: "not-allowed",
};

function ProfileFormContent({ 
  userProfile, 
  authUserId 
}: { 
  userProfile: UserProfileData, 
  authUserId: string | number | undefined 
}) {
  const { updateUser: updateAuthContext } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: userProfile?.name || "",
    phone: formatPhone(userProfile?.phoneNumber),
    cpf: formatCPF(userProfile?.cpf)
  });

  const [imageVersion, setImageVersion] = useState<number>(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartEditing = () => {
    setFormData({
        name: userProfile.name || "",
        phone: formatPhone(userProfile.phoneNumber),
        cpf: formatCPF(userProfile.cpf)
    });
    setIsEditing(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Sessão inválida");

      const payload = {
        name: formData.name,
        phoneNumber: cleanDigits(formData.phone),
        cpf: cleanDigits(formData.cpf),
        email: userProfile.email,
        userType: userProfile.userType
      };

      const textRes = await fetch(`http://localhost:8081/api/users/${authUserId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!textRes.ok) throw new Error("Erro ao salvar dados");

      let newPhotoUrl = userProfile.photoUrl;
      if (selectedFile) {
        const formDataImg = new FormData();
        formDataImg.append("file", selectedFile);
        const photoRes = await fetch(`http://localhost:8081/api/users/${authUserId}/photo`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${token}` },
            body: formDataImg
        });
        if (!photoRes.ok) throw new Error("Erro ao enviar foto");
        const photoData = await photoRes.json();
        newPhotoUrl = photoData.photoUrl;
      }
      return { ...payload, photoUrl: newPhotoUrl };
    },
    onSuccess: (newData) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      const timestamp = Date.now();
      const finalPhotoUrl = newData.photoUrl 
        ? (newData.photoUrl.includes('?') ? `${newData.photoUrl}&v=${timestamp}` : `${newData.photoUrl}?v=${timestamp}`) 
        : null;
      updateAuthContext({
        name: newData.name,
        phoneNumber: newData.phoneNumber,
        cpf: newData.cpf,
        ...(finalPhotoUrl && { photoUrl: finalPhotoUrl })
      });
      setImageVersion(timestamp);
      setSelectedFile(null);
      setPreviewImage(null);
      setIsEditing(false);
      addToast("Perfil atualizado com sucesso!", "success");
    },
    onError: () => addToast("Falha ao salvar alterações.", "error")
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "cpf") setFormData(prev => ({ ...prev, [name]: formatCPF(value) }));
    else if (name === "phone") setFormData(prev => ({ ...prev, [name]: formatPhone(value) }));
    else setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setSelectedFile(file);
    }
  };

  const getDisplayImage = () => {
    if (previewImage) return previewImage;
    if (userProfile.photoUrl) {
       const separator = userProfile.photoUrl.includes('?') ? '&' : '?';
       return `${userProfile.photoUrl}${separator}v=${imageVersion}`;
    }
    return null;
  };
  const displayImage = getDisplayImage();

  return (
    <div className="profile-container">
      <div className="profile-card">

        <div className={`profile-left-col ${isEditing ? 'avatar-editable' : ''}`}>
          <div className="profile-card-avatar-container" onClick={() => isEditing && fileInputRef.current?.click()}>
            {displayImage ? (
              <img 
                src={displayImage} 
                alt="Perfil" 
                className="profile-avatar"
                onError={(e) => { e.currentTarget.style.display = 'none'; }} 
              />
            ) : (
              <div className="profile-card-placeholder">{(formData.name || "U").charAt(0).toUpperCase()}</div>
            )}
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          <h1 className="user-name">{userProfile.name}</h1>
          {userProfile.userType && <span className="user-role-badge">{translateRole(userProfile.userType)}</span>}
          {!isEditing && (
            <button className="btn-edit-profile-main" onClick={handleStartEditing}>
                <EditIcon /> Editar Perfil
            </button>
          )}
        </div>

        <div className="profile-right-col">
          <div className="detail-section">
            <h2 className="section-title">Dados Pessoais</h2>
            <div className="info-grid-modern">
              
              <div style={formGroupStyle}>
                {isEditing ? (
                    <>
                        <label style={labelStyle}>Nome Completo</label>
                        <input 
                            type="text" 
                            name="name" 
                            style={inputStyle} 
                            value={formData.name || ""} 
                            onChange={handleInputChange} 
                        />
                    </>
                ) : (
                    <>
                       <span className="info-label">Nome Completo</span>
                       <span className="info-value">{userProfile.name}</span>
                    </>
                )}
              </div>

              <div style={formGroupStyle}>
                {isEditing ? (
                    <>
                        <label style={labelStyle}>E-mail (Não editável)</label>
                        <input 
                            type="text" 
                            style={disabledInputStyle} 
                            value={userProfile.email || ""} 
                            disabled 
                        />
                    </>
                ) : (
                    <>
                        <span className="info-label">E-mail Principal</span>
                        <span className="info-value">{userProfile.email}</span>
                    </>
                )}
              </div>

              <div style={formGroupStyle}>
                {isEditing ? (
                    <>
                        <label style={labelStyle}>Telefone / WhatsApp</label>
                        <input 
                            type="text" 
                            name="phone" 
                            style={inputStyle}
                            placeholder="(00) 00000-0000" 
                            value={formData.phone || ""} 
                            onChange={handleInputChange} 
                            maxLength={15} 
                        />
                    </>
                ) : (
                    <>
                        <span className="info-label">Telefone</span>
                        <span className="info-value">{formatPhone(userProfile.phoneNumber) || "Não informado"}</span>
                    </>
                )}
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h2 className="section-title">Documentação</h2>
            <div className="info-grid-modern">
              <div style={formGroupStyle}>
                {isEditing ? (
                    <>
                        <label style={labelStyle}>CPF</label>
                        <input 
                            type="text" 
                            name="cpf" 
                            style={inputStyle}
                            placeholder="000.000.000-00" 
                            value={formData.cpf || ""} 
                            onChange={handleInputChange} 
                            maxLength={14} 
                        />
                    </>
                ) : (
                    <>
                        <span className="info-label">CPF</span>
                        <span className="info-value">{userProfile.cpf ? formatCPF(userProfile.cpf) : "Não cadastrado"}</span>
                    </>
                )}
              </div>

              <div className="info-item-modern">
                <span className="info-label">ID de Usuário</span>
                <span className="info-value" style={{ fontFamily: 'monospace', fontSize: '13px', color: '#6b7280' }}>
                  {userProfile.userId || userProfile.id}
                </span>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="form-actions">
                <button className="btn-cancel" onClick={() => setIsEditing(false)} disabled={saveMutation.isPending}>
                    Cancelar
                </button>
                <button className="btn-save" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? "Salvando..." : <><SaveIcon /> Salvar Alterações</>}
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user: authUser, isAuthenticated, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const { data: userProfile, isLoading, isError } = useQuery<UserProfileData>({
    queryKey: ['userProfile', authUser?.id],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");
      const res = await fetch(`http://localhost:8081/api/users/${authUser?.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("401");
        throw new Error("Erro");
      }
      return res.json();
    },
    enabled: !!authUser?.id,
  });

  if (authLoading || isLoading) return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  if (isError || !userProfile) return <div className="flex h-screen items-center justify-center">Erro ao carregar.</div>;

  return (
    <div id="profile-wrapper">
      <Header />
      <main>
        <ProfileFormContent 
            key={userProfile.id || userProfile.userId} 
            userProfile={userProfile} 
            authUserId={authUser?.id} 
        />
      </main>
    </div>
  );
}