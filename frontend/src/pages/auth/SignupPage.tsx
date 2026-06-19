import {useState} from "react";
import {register} from "../../services/authService"
import { useNavigate, Link } from "react-router-dom";

const SignupPage =()=>{

    const [name, setName]= useState("");
    const [email, setEmail]= useState("");
    const [password, setPassword]= useState("");
    const [Confirmpassword, setConfirmPassword]= useState("");
    const [district, setDistict]= useState("");

    const [isLoading, setIsLoading]= useState(false);
    const [error, setError]= useState("");

    
    const navigate = useNavigate();

    const handleSubmit= async(e:React.FormEvent)=>{
        e.preventDefault();

        if(!email || !name || !password || !Confirmpassword ){
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

            await register({name,email,password,district});
            navigate("/login");

        }
        catch(error:any){
            setError(error.response?.data?.error || "signup failed");
        }finally{
            setIsLoading(false);
        }

    }

    return(
        <div>
            <h2> register Page</h2>

            

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>

                <div>
                    <label>name</label>
                    <input type="text" value={name} placeholder="John Doe" onChange={(e)=>{setName(e.target.value)}}/>

                </div>

                <div>
                    <label>email</label>
                    <input type="email" value={email} placeholder="your@email.com" onChange={(e)=>{setEmail(e.target.value)}}/>

                </div>

                <div>
                    <label>password</label>
                    <input type="password" value={password} placeholder="" onChange={(e)=>{setPassword(e.target.value)}}/>
                </div>

                <div>
                    <label>confirm password</label>
                    <input type="password" value={Confirmpassword} placeholder="" onChange={(e)=>{setConfirmPassword(e.target.value)}}/>
                </div>

                <div>
                    <label>district</label>
                    <input type="text" value={district} placeholder="" onChange={(e)=>{setDistict(e.target.value)}}/>
                </div>

                <button type="submit" disabled={isLoading}>
                    {isLoading ? "registering" : "register"}
                </button>

            </form>
            <p>
                Already have an account? <Link to="/login">Log in</Link>
            </p>
            

        </div>
    );
    
};

export default SignupPage ;