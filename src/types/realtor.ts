export type RealtorUserType = "REALTOR" | "AGENCY_ADMIN" | "ADMIN";

export type RealtorStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

export interface RealtorResponse {
  userId: string;
  name: string;
  email: string;
  cpf: string;
  creciNumber: string; 
  phoneNumber?: string;
  userType: RealtorUserType;
  status: RealtorStatus;
  photoUrl?: string;
  propertiesCount?: number;
  agencyId?: string; 
  agency?: {
    agencyId: string;
    name: string;
  };
}


export interface RealtorRegistrationRequest {
  name: string;
  email: string;
  cpf: string;
  creciNumber: string;
  phoneNumber: string;
  password?: string;
}