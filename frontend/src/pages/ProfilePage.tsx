
import {Link} from "react-router-dom";
import {useState} from "react";

const ProfilePage=()=>{

    const [name,setName]= useState("");
    const [email, setEmail]= useState("");

    const [isLoading, setIsLoading]= useState(false);
    const [error, setError]= useState("");


    return (
        <div>
        <div>Your profile</div>

        <h3>Mange your account and preferences </h3> 

        your name
        <input type="text" name="name" value={name}></input>
        <button>Edit name</button>

        <br></br>

        email_address
        <input type="text" name="email" value={email}></input>

        <br></br>

        change Password
        <Link to="/ForgotPasswordPage"></Link>

        <br></br>

        signout
        <Link to=""></Link>

        <br></br>

        delete_account
        <Link to=""></Link>

        <br></br>

        </div>

        
        

    );
};

export default ProfilePage ;