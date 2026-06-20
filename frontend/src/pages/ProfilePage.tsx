import {useState,} from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { login } from "../services/authService";
import useAuth from "../hooks/useAuth";


const ProfilePage=()=>{

    const [email, setEmail]= useState("");
    const [password, setPassword]= useState("");

    const [isLoading, setIsLoading]= useState(false);
    const [error, setError]= useState("");

    const navigate= useNavigate();
    const [searchParams]= useSearchParams();

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
        <div>
            <h2> Login Page</h2>

            {successMsg==="email_verified" && (
                <p>Email verified successfully! Please login..</p>
            )}

            {successMsg==="password_updated" &&(
                <p>Password updated! Please login.</p>
            )}

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Email</label>
                    <input type="email" value={email} placeholder="your@email.com" onChange={(e)=>{setEmail(e.target.value)}}/>

                </div>

                <div>
                    <label>password</label>
                    <input type="password" value={password} placeholder="" onChange={(e)=>{setPassword(e.target.value)}}/>
                </div>

                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                </button>

            </form>
            <p>
                Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
            <p>
                <Link to="/forgot-password">Forgot password?</Link>
            </p>

        </div>
    );
};

export default ProfilePage ;