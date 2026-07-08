
import { Link } from "react-router-dom";
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import api from "../services/api"
import { useNavigate } from "react-router-dom";




const ProfilePage = () => {

    const navigate = useNavigate();
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
        const new_name=draftName.trim()
        
        api.put("/auth/profile/update-name", { new_name: new_name });
    };

    const handleNameEditCancel = () => {
        setDraftName(name); 
        setIsNameEditing(false);
    };


    //edit district 
    const [isDistrictEditing, setIsDistrictEditing] = useState(false);
    const [draftDistrict, setDraftDistrict] = useState(district);

    const handleDistrictEditClick = () => {
        setDraftDistrict(district);
        setIsDistrictEditing(true);
    };

    const handleDistrictSave = async () => {
        if (!draftDistrict) return;
        try {
            await api.put("/auth/profile/update-district", { new_district: draftDistrict });
            setDistrict(draftDistrict);
            setIsDistrictEditing(false);
        } catch (error: any) {
            console.error("Failed to update district:", error);
        }
    };

    const handleDistrictEditCancel = () => {
        setDraftDistrict(district);
        setIsDistrictEditing(false);
    };
    

    //delete account

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        setDeleteError("");
        try {
            await api.delete("/auth/profile/delete-account");

            
            localStorage.removeItem("token");

            navigate("/login");
        } catch (error: any) {
            setDeleteError(error.response?.data?.error || "Failed to delete account");
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };


    return (
        <div>
        <div>Your profile</div>

        <h3>Mange your account and preferences </h3>

        <div className="editNameDiv">
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

        <div className="editDistrictDiv">
                <label>district</label>
                {isDistrictEditing ? (
                    <>
                        <select
                            value={draftDistrict}
                            onChange={(e) => setDraftDistrict(e.target.value)}
                        >
                            <option value="">Select a district</option>
                            {SRI_LANKA_DISTRICTS.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                        <button onClick={handleDistrictSave}>Save</button>
                        <button onClick={handleDistrictEditCancel}>Cancel</button>
                    </>
                ) : (
                    <>
                        <span>{district || "Not set"}</span>
                        <button onClick={handleDistrictEditClick}>Change district</button>
                    </>
                )}
        </div>

        <br></br>

        
        <Link to="/forgot-password">change Password</Link>

        <br></br>

        
        <Link to="/">signout</Link>

        <br></br>
        
        <div className="delAccountDiv">
        <button onClick={() => setShowDeleteConfirm(true)}>Delete account</button>

        {showDeleteConfirm && (
            <div className="confirmDialog">
                <p>Are you sure you want to delete your account? This cannot be undone.</p>
                <button onClick={handleDeleteAccount} disabled={isDeleting}>
                    {isDeleting ? "Deleting..." : "Yes, delete my account"}
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                    Cancel
                </button>
            </div>
        )}

        {deleteError && <p style={{ color: "red" }}>{deleteError}</p>}
        </div>
        

        
        
    </div>
    );
};

export default ProfilePage ;