import {useState} from "react";
import {resetPassword} from "../../services/authService"
import { useNavigate, Link } from "react-router-dom";

const ResetPasswordPage =()=>{

    
    const [password, setPassword]= useState("");
    const [Confirmpassword, setConfirmPassword]= useState("");
    

    const [isLoading, setIsLoading]= useState(false);
    const [error, setError]= useState("");

    
    const navigate = useNavigate();

    const handleSubmit= async(e:React.FormEvent)=>{
        e.preventDefault();

        if( !password || !Confirmpassword ){
            setError("All fields are required");
            return;
        }

        if (password!=Confirmpassword){
                setError("passwords are not match");
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        setIsLoading(true);
        setError("");

        try{

            await resetPassword({password, Confirmpassword});
            navigate("/login");

        }
        catch(error:any){
            setError(error.response?.data?.error || "password update failed");
        }finally{
            setIsLoading(false);
        }

    }

    return(
        <div>
            <h2> reset password Page</h2>

            

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>

                

                <div>
                    <label>password</label>
                    <input type="password" value={password} placeholder="" onChange={(e)=>{setPassword(e.target.value)}}/>
                </div>

                <div>
                    <label>confirm password</label>
                    <input type="password" value={Confirmpassword} placeholder="" onChange={(e)=>{setConfirmPassword(e.target.value)}}/>
                </div>

                

                <button type="submit" disabled={isLoading}>
                    {isLoading ? "saving" : "save"}
                </button>

            </form>
            <p>
                log in <Link to="/login">Log in</Link>
            </p>
            

        </div>
    );
    
};

export default ResetPasswordPage ;