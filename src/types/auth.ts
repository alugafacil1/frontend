export interface User {
  id?: string;
  name: string;
  email: string;
  role: "TENANT" | "OWNER" | "REALTOR" | "ADMIN"; 
  photoUrl?: string;      
  phoneNumber?: string;   
  cpf?: string;
}

export interface LoginResponse {
  access_token: string; 
  refresh_token: string; 
  roles: string[];
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, phone: string, cpf: string, type: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}