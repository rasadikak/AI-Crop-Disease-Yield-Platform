
import {Link} from "react-router-dom";

const ProfilePage=()=>{



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
        <Link to=""></Link>

        signout
        <Link to=""></Link>

        delete_account
        <Link to=""></Link>

        </div>

        
        

    );
};

export default ProfilePage ;