import {Navigate} from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import type{ReactNode} from "react";




const protectedRoute=  ({children}:{children:ReactNode})=>{
    const {token, isLoading}= useAuth();

  
    if (isLoading) {
        return <div>Loading...</div>;
    }

    
    if (!token) {
        return <Navigate to="/login" />;
    }

    
    return <>{children}</>;

};

export default protectedRoute;