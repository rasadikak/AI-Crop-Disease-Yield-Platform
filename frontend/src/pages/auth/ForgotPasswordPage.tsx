import {useState} from "react";
import {forgotPassword} from "../../services/authService"
import { Link } from "react-router-dom";

const ForgotPasswordPage =()=>{

    
    const [email, setEmail]= useState("");
    
    

    const [isLoading, setIsLoading]= useState(false);
    const [error, setError]= useState("");
    const [sent, setSent]       = useState(false);

    
    

    const handleSubmit= async(e:React.FormEvent)=>{
        e.preventDefault();

        if( !email ){
            setError("email is required");
            return;
        }

        
        

        
        setIsLoading(true);
        setError("");

        try{

            await forgotPassword(email);
            setSent(true); 

        }
        catch(error:any){
            setError(error.response?.data?.error || "password reset link error ");
        }finally{
            setIsLoading(false);
        }

    }

    if (sent) {
    return (
      <div>
        <h2>forgotPassword page</h2>
        <p>We sent a password reset request link to {email}. Click it to verify your account.</p>
        <Link to="/login">Back to login</Link>
      </div>
    );
    }

    return(
        <div>
            <h2> password reset request</h2>

            <p>Enter your email to receive a reset link.</p>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>

                

                <div>
                    <label>email</label>
                    <input type="email" value={email} placeholder="" onChange={(e)=>{setEmail(e.target.value)}}/>
                </div>

                

                

                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send reset Email"}
                </button>

            </form>
            
            <p>
                <Link to="/login">Back to login</Link>
            </p>
            

        </div>
    );
    
};

export default ForgotPasswordPage ;