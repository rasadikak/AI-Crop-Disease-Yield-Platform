import {useState,} from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { login } from "../../services/authService";
import useAuth from "../../hooks/useAuth";


const LoginPage =()=>{

    const [email, setEmail]= useState("");
    const [password, setPassword]= useState("");

    const [isLoading, setIsLoading]= useState("false");
    const [error, setError]= useState("");

    const navigate= useNavigate();
    const searchParams= useSearchParams();

    const successMsg= searchParams.get("success");

    const {loginUser}=useAuth();

    const handleSubmit=async(e:React.FormEvent)=>{

        e.preventDefault();
        if (!email || !password){
            setError("Email and password are required!");
            return;
        }

        setIsLoading(true);
        setError("");

        try{
            const response= await login({email,password});

            loginUser(response);

            navigate("/dahsboard");

        } catch(error:any){
            setError(error.response?.data?.error || "Login failed");
        }finally{
            setIsLoading(false);
        }
    }





    return(
        <div>LoginPage </div>
    );
};

export default LoginPage ;