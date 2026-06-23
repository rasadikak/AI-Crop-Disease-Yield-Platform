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

    // allow sending message by pressing Enter key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
        }
    };

    // if widget is closed, show just the toggle button
    if (!isOpen) {
        return (
        <div>
            <button onClick={() => setIsOpen(true)}>
            Chat with AgriSense AI
            </button>
        </div>
        )}

    return (
    <div>
      {/* header */}
      <div>
        <h3>AgriSense Assistant</h3>
        <button onClick={() => setIsOpen(false)}>Close</button>
      </div>

      {/* message list */}
      <div>
        {messages.length === 0 && (
          <p>Ask me anything about farming — crops, fertilizer, diseases, and more.</p>
        )}

        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.role === "user" ? "You" : "AgriSense"}:</strong>
            <span>{msg.content}</span>
          </div>
        ))}

        {/* loading indicator while waiting for AI response */}
        {isLoading && (
          <div>
            <strong>AgriSense:</strong>
            <span>Thinking...</span>
          </div>
        )}

        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* invisible div at the bottom — scroll target */}
        <div ref={bottomRef} />
      </div>

      {/* input area */}
      <div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about crops, fertilizer, diseases..."
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading || !input.trim()}>
          {isLoading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ChatbotPage ;