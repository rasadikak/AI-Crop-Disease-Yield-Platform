import {useState} from "react";
import {sendVerificationEmail} from "../../services/authService"
import { useNavigate, Link,  useSearchParams } from "react-router-dom";

const VerifyEmailPage =()=>{

    
    const [email, setEmail]= useState("");
    
    

    const [isLoading, setIsLoading]= useState(false);
    const [error, setError]= useState("");

    
    

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
            

        }
        catch(error:any){
            setError(error.response?.data?.error || "verification mail sent failed");
        }finally{
            setIsLoading(false);
        }

    }

    return(
        <div>
            <h2> verify email page</h2>

            

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>

                

                <div>
                    <label>email</label>
                    <input type="email" value={email} placeholder="" onChange={(e)=>{setEmail(e.target.value)}}/>
                </div>

                

                

                <button type="submit" disabled={isLoading}>
                    {isLoading ? "saving" : "save"}
                </button>

            </form>
            
            

        </div>
    );
    
};

export default VerifyEmailPage ;