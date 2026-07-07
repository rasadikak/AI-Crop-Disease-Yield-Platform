
import { Link } from "react-router-dom";
import { useState } from "react";
import useAuth from "../hooks/useAuth";

const ProfilePage = () => {
    const { farmer } = useAuth();
    const [name, setName] = useState(farmer?.name ?? "");
    const [email, setEmail] = useState(farmer?.email ?? "");
    const [district, setDistrict] = useState(farmer?.district ?? "");

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
        <input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} />
        <button>Edit name</button>

        <br></br>

        email_address
        <input type="text" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />

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