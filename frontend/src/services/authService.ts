import api from "./api";
import type {RegisterData, LoginData, AuthResponse} from "../types/index";

export const register= async(data: RegisterData): Promise <void>=>{
    await api.post("/auth/register", data);
};

export const login = async(data:LoginData): Promise<AuthResponse> =>{
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
};

export const logout = async(): Promise<void> =>{
    await api.post("/auth/logout");
    await api.get("/auth/logout");
};



