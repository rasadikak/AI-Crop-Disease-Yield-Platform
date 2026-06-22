import { useEffect, useReducer, useState } from "react";
import useAuth from "../../hooks/useAuth";
import chatbotService  from "../../services/featureService";


interface Message{
    role: "user" | "assistent";
    content: string;
}

const ChatbotPage=()=>{

    return (
        <div>
            
        </div>
    );
};

export default ChatbotPage ;