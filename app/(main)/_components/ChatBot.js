"use client"
import { useState, useRef, useEffect } from "react";

export default function ChatBot({ onClose }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm the CoachLume assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: "user", content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question: trimmed,
          history: messages.slice(-10) 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

      setMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, something went wrong. Please try again." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-20 right-6 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-blue-600 text-white">
        <span className="font-semibold">CoachLume Assistant</span>
        <button 
          onClick={onClose} 
          className="hover:bg-blue-700 rounded p-1 transition"
          aria-label="Close chat"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-3 h-80 overflow-y-auto space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <p className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
              m.role === "user" 
                ? "bg-blue-600 text-white rounded-br-md" 
                : "bg-gray-100 dark:bg-gray-800 dark:text-gray-100 rounded-bl-md"
            }`}>
              {m.content}
            </p>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <p className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-2xl rounded-bl-md text-sm">
              <span className="animate-pulse">Thinking...</span>
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex border-t border-gray-200 dark:border-gray-700">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about CoachLume..."
          disabled={loading}
          className="flex-1 p-3 bg-transparent outline-none text-sm disabled:opacity-50"
        />
        <button 
          onClick={sendMessage} 
          disabled={loading || !input.trim()}
          className="px-4 bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}
