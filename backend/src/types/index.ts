export interface Farmer{
  id: string;
  password: string;
  name: string;
  email: string;
  district: string | null;
  createdAt: Date;
}

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  district?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AuthResponse{
    token:string;
    farmer:Omit<Farmer, "created_at">;
}