export function translateRole(role?: string) {
  if (!role) return "Usuário";
  const roles: Record<string, string> = { 
    ADMIN: "Administrador do Sistema", 
    AGENCY_ADMIN: "Administrador da Imobiliária",
    REALTOR: "Corretor", 
    OWNER: "Proprietário", 
    TENANT: "Inquilino"
  };  return roles[role] || role;
}