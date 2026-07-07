import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import type { ReactNode } from "react";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { token, farmer, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const isAuthenticated = Boolean(token && token.trim() && farmer);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;