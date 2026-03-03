export interface MemberResponse {
    userId: string;
    name: string;
    email: string;
    userType: 'ADMIN' | 'REALTOR' | 'OWNER' | 'TENANT';
}

export interface AgencyResponse {
    agencyId: string;
    name: string;
    corporateName: string;
    email: string;
    photoUrl: string | null;
    cnpj: string;
    website: string | null;
    phoneNumber: string | null;
    members: MemberResponse[]; 
    status: 'ACTIVE' | 'PENDING' | 'BLOCKED' | 'INACTIVE';
}

export interface PaginatedAgencyResponse {
    content: AgencyResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface AgencyRequest {
    name: string;
    corporateName: string;
    email: string;
    photoUrl: string | null;
    cnpj: string;
    website: string | null;
    phoneNumber: string | null;
}