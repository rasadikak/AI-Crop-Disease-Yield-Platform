import {Link} from "react-router-dom";

const DashboardPage=()=>{
    return(
        <div>
            <h2>dashboard</h2>
            <Link to="/chatbot">chatbot</Link>
            <Link to="/profile">profile</Link>
        </div>


    );
};

export default DashboardPage;