import { useEffect, useReducer, useState } from "react";
import useAuth from "../../hooks/useAuth";
import api from "../../services/api";


interface Message{
    role: "user" | "assistent";
    content: string;
}


const ChatbotPage=()=>{

    const [messages, setMessages]   = useState<Message[]>([]);
    const [input, setInput]         = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen]       = useState(false);
    const [error, setError]         = useState("");

    return (
        <div>
            
        </div>
    );
};

export default ChatbotPage ;