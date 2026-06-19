import {useState} from "react";
import {sendVerificationEmail} from "../../services/authService"
import { Link } from "react-router-dom";

const VerifyEmailPage =()=>{

    
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

            await sendVerificationEmail(email);
            setSent(true); 

        }
        catch(error:any){
            setError(error.response?.data?.error || "verification mail sent failed");
        }finally{
            setIsLoading(false);
        }

    }

    if (sent) {
    return (
      <div>
        <h2>Check your email</h2>
        <p>We sent a verification link to {email}. Click it to verify your account.</p>
        <Link to="/login">Back to login</Link>
      </div>
    );
    }

    return(
        <div>
            <h2> verify email page</h2>

            <p>Enter your email to receive a verification link.</p>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>

                

                <div>
                    <label>email</label>
                    <input type="email" value={email} placeholder="" onChange={(e)=>{setEmail(e.target.value)}}/>
                </div>

                

                

                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Verification Email"}
                </button>

            </form>
            
            <p>
                <Link to="/login">Back to login</Link>
            </p>
            

        </div>
    );
    
};

export default VerifyEmailPage ;