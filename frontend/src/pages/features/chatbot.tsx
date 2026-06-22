import { useEffect, useRef, useState } from "react";
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

    //used for auto-scroll
    const bottomRef= useRef<HTMLDivElement>(null);

    const {token}= useAuth();

     // auto-scroll to bottom every time messages update
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend= async()=>{
        if(!input.trim() || isLoading){
            return;
        }
        const userMessage= input.trim();
        setInput("");
        setError("");
    }

    return (
        <div>
            
        </div>
    );
};

export default ChatbotPage ;