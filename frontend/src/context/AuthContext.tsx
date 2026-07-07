import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { Farmer, AuthResponse } from "../types/index";

interface AuthContextType {
  farmer: Farmer | null;
  token: string | null;
  isLoading: boolean;
  loginUser: (data: AuthResponse) => void;
  logoutUser: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const getStoredAuth = () => {
  const savedToken = localStorage.getItem("token");
  const savedFarmer = localStorage.getItem("farmer");

  const hasValidToken = typeof savedToken === "string" && savedToken.trim() !== "";
  const hasValidFarmer = typeof savedFarmer === "string" && savedFarmer.trim() !== "";

  if (!hasValidToken || !hasValidFarmer) {
    localStorage.removeItem("token");
    localStorage.removeItem("farmer");
    return { token: null, farmer: null };
  }

  try {
    return {
      token: savedToken,
      farmer: JSON.parse(savedFarmer) as Farmer,
    };
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("farmer");
    return { token: null, farmer: null };
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedAuth = getStoredAuth();
    setToken(storedAuth.token);
    setFarmer(storedAuth.farmer);
    setIsLoading(false);
  }, []);

  const loginUser = (data: AuthResponse) => {
    const nextToken = data.token?.trim();
    const nextFarmer = data.farmer;

    if (!nextToken || !nextFarmer) {
      return;
    }

    setToken(nextToken);
    setFarmer(nextFarmer);
    localStorage.setItem("token", nextToken);
    localStorage.setItem("farmer", JSON.stringify(nextFarmer));
  };

  const logoutUser = () => {
    setToken(null);
    setFarmer(null);
    localStorage.removeItem("token");
    localStorage.removeItem("farmer");
  };

  return (
    <AuthContext.Provider value={{ farmer, token, isLoading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};