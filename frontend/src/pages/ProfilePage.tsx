
import { Link } from "react-router-dom";
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import api from "../services/api"

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

    //name editing
    const [isNameEditing, setIsNameEditing] = useState(false);
    const [draftName, setDraftName] = useState(name);

    const handleNameEditClick = () => {
        setDraftName(name); 
        setIsNameEditing(true);
    };

    const handleNameSave = () => {
        if (!draftName.trim()) return;
        setName(draftName.trim());
        setIsNameEditing(false);
        
        await api.put("/auth/profile/update-name", { name: draftName.trim() });
    };

    const handleNameEditCancel = () => {
        setDraftName(name); 
        setIsNameEditing(false);
    };




    return (
        <div>
        <div>Your profile</div>

        <h3>Mange your account and preferences </h3>

        <div>
            <label>name</label>
            
            {isNameEditing ? (
                <>
                    <input
                        type="text"
                        name="name"
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        autoFocus
                    />
                    <button onClick={handleNameSave}>Save</button>
                    <button onClick={handleNameEditCancel}>Cancel</button>
                </>
            ) : (
                <>
                    <span>{name}</span>
                    <button onClick={handleNameEditClick}>Edit name</button>
                </>
            )}
        </div>



        <br></br>
        <div>
            <label>email_address</label>
            <input type="text" name="email" value={email} />
        </div>

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