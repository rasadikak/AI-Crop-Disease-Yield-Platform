// ─── chatbot.tsx ─────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import { Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ChatbotPage = () => {
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState("");
  const bottomRef                 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput("");
    setError("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    try {
      const response = await api.post("/chat/message", { message: userMessage });
      setMessages(prev => [...prev, { role: "assistant", content: response.data.reply }]);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to get response");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">

      {/* header */}
      <div className="bg-green-800 px-4 py-3 flex items-center gap-2 flex-shrink-0">
        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-lg">🌿</div>
        <div>
          <p className="text-white font-semibold text-sm">AgriSense Assistant</p>
          <p className="text-green-300 text-xs">AI-powered farming help</p>
        </div>
        <div className="ml-auto w-2 h-2 bg-green-400 rounded-full" title="Online" />
      </div>

      {/* message list */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-gray-50">

        {/* welcome message */}
        {messages.length === 0 && (
          <div className="flex gap-2">
            <div className="w-7 h-7 bg-green-700 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">🌿</div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-3 py-2 shadow-sm max-w-[85%]">
              <p className="text-gray-700 text-sm leading-relaxed">
                Hello! I'm your AgriSense assistant. Ask me about crops, fertilizer, diseases, planting times, and more.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* avatar */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5 ${
              msg.role === "user"
                ? "bg-green-700 text-white"
                : "bg-amber-100 text-amber-700"
            }`}>
              {msg.role === "user" ? "Y" : "🌿"}
            </div>

            {/* bubble */}
            <div className={`px-3 py-2 rounded-2xl shadow-sm max-w-[80%] text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-green-700 text-white rounded-tr-none"
                : "bg-white border border-gray-100 text-gray-700 rounded-tl-none"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* typing indicator */}
        {isLoading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">🌿</div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* input area */}
      <div className="px-3 py-3 border-t border-gray-100 bg-white flex-shrink-0">
        <div className="flex gap-2 items-end">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about crops, diseases..."
            disabled={isLoading}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 resize-none"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-green-700 hover:bg-green-800 disabled:bg-gray-200 text-white disabled:text-gray-400 p-2 rounded-xl transition-colors flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;