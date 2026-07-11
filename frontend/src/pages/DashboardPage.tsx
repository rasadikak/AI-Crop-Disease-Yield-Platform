import { Link } from "react-router-dom";
import ChatbotPage from "./features/chatbot"; 

const DashboardPage = () => {
    return (
        <div style={{ display: "flex" }}>
            {/* main dashboard content */}
            <div style={{ flex: 1 }}>
                <h2>dashboard</h2>
                
                
            </div>

            {/* chatbot floating on the right */}
            <div style={{ position: "fixed", bottom: 20, right: 20, width: 320 }}>
                <ChatbotPage />
            </div>
        </div>
    );
};

export default DashboardPage;