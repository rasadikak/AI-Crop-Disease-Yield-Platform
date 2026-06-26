
import {Link} from "react-router-dom";
import {useState} from "react";

const ProfilePage=()=>{

    const [name,setName]= useState("");
    const [email, setEmail]= useState("");
    const [district, setDistrict]= useState("");

    const [isLoading, setIsLoading]= useState(false);
    const [error, setError]= useState("");

    const SRI_LANKA_DISTRICTS = [
        "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
        "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
        "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
        "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
        "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
        ];

    


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

        district
        <select value={district} onChange={(e) => setDistrict(e.target.value)}>
                    
        <option value="">Select a district</option>
            {SRI_LANKA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                        ))}
        </select>
        <button>change district</button>

        <br></br>

        change Password
        <Link to="/forgot-password"></Link>

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