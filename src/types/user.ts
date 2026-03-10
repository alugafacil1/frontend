export type UserType = 'ADMIN' | 'REALTOR' | 'OWNER' | 'TENANT' | 'AGENCY_ADMIN';

export interface AgencySummary {
    agencyId: string;
    name: string;
    corporateName?: string;
    email: string;
    photoUrl?: string;
    cnpj?: string;
    website?: string;
    phoneNumber?: string;
    status: string;
}

export interface UserResponse {
    userId: string;
    name: string;
    email: string;
    photoUrl?: string;
    cpf: string;
    creciNumber?: string;
    phoneNumber: string;
    userType: UserType;
    
    agency?: AgencySummary | null; 
    
    status: 'ACTIVE' | 'BLOCKED' | 'INACTIVE' | 'PENDING_ACTIVATION';
    propertiesCount: number;
}