// what a farmer looks like after login
export interface Farmer {
  id: number;
  name: string;
  email: string;
  district: string | null;
  isVerified: boolean;
}

// what the backend sends back after login
export interface AuthResponse {
  token: string;
  farmer: Farmer;
}

// what the signup form sends to backend
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  district?: string;  // optional
}

// what the login form sends to backend
export interface LoginData {
  email: string;
  password: string;
}