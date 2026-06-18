import { createContext, useState, useEffect } from "react";
import type{ReactNode} from "react";
import type{ Farmer, AuthResponse } from "../types/index";


interface AuthContextType {
  farmer:    Farmer | null;  // null = not logged in
  token:     string | null;
  isLoading: boolean;        // true while checking if user is logged in
  loginUser:  (data: AuthResponse) => void;
  logoutUser: () => void;
}


export const AuthContext = createContext<AuthContextType | null>(null);


export const AuthProvider = ({ children }: { children: ReactNode }) => {

  
  const [farmer,    setFarmer]    = useState<Farmer | null>(null);
  const [token,     setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken  = localStorage.getItem("token");
    const savedFarmer = localStorage.getItem("farmer");

    if (savedToken && savedFarmer) {
      setToken(savedToken);
      setFarmer(JSON.parse(savedFarmer)); // convert string back to object
    }

    setIsLoading(false); 
  }, []); // [] = run only once when app loads

  
  const loginUser = (data: AuthResponse) => {
    setToken(data.token);
    setFarmer(data.farmer);
    localStorage.setItem("token",  data.token);
    localStorage.setItem("farmer", JSON.stringify(data.farmer)); // object → string
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