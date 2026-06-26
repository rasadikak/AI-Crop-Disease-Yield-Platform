
import {Link} from "react-router-dom";
import {useState} from "react";

const ProfilePage=()=>{

    const [name,setName]= useState("");
    const [email, setEmail]= useState("");


    return (
        <div>
        <div>Your profile</div>

        <h3>Mange your account and preferences </h3> 

        your name
        <input type="text" name="name" value={}></input>
        <button>Edit name</button>

        email_address
        <input type="text" name="email" value={}></input>

        change Password
        <Link to="/ForgotPasswordPage"></Link>

        signout
        <Link to=""></Link>

        delete_account
        <Link to=""></Link>

        </div>

        
        

    );
};

export default ProfilePage ;