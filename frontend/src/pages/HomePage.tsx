import {Link} from "react-router-dom";

const HomePage=()=>{
    return(
        <div>
            <h2>AgriSense</h2>
            <Link to="signup">Sign up</Link>
            <Link to="login">Sign in</Link>
        </div>

    );
};

export default HomePage;