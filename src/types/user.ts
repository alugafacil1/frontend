export type UserType = 'ADMIN' | 'REALTOR' | 'OWNER' | 'TENANT' | 'AGENCY_ADMIN';

export interface UserResponse {
    userId: string;
    name: string;
    email: string;
    photoUrl?: string;
    cpf: string;
    creciNumber?: string;
    phoneNumber: string;
    userType: UserType;
    agency?: any;
    status: 'ACTIVE' | 'BLOCKED' | 'INACTIVE' | 'PENDING_ACTIVATION';
    propertiesCount: number;
}