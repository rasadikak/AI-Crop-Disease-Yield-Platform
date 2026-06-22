import { useEffect, useRef, useState } from "react";
import useAuth from "../../hooks/useAuth";
import api from "../../services/api";


interface Message{
    role: "user" | "assistant";
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

        // add user message to UI immediately — don't wait for the API
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);

        setIsLoading(true);

        try{

            const response = await api.post("/chat/message", {
                message: userMessage
            });
            setMessages(prev => [
                ...prev,
                { role: "assistant", content: response.data.reply }
            ]);

        }catch(error:any){
           setError(error.response?.data?.error || "Failed to get response");
        }finally{
            setIsLoading(false);
        }

    }

    return (
        <div>
            
        </div>
    );
};

export default ChatbotPage ;