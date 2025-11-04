"use client";
import { useState } from "react";

export default function ChatBot() {
const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user" , content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const res = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: input }),
    });
    const data = await res.json();

    const botMsg = { role: "assistant" , content: data.answer };
    setMessages((prev) => [...prev, botMsg]);
  };

  return (
    <div className="fixed bottom-20 right-6 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border">
      <div className="p-3 h-80 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`my-2 ${m.role === "user" ? "text-right" : "text-left"}`}>
            <p
              className={`inline-block px-3 py-2 rounded-xl ${
                m.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              {m.content}
            </p>
          </div>
        ))}
      </div>

      <div className="flex border-t">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about CoachLume..."
          className="flex-1 p-2 bg-transparent outline-none"
        />
        <button onClick={sendMessage} className="p-2 bg-blue-600 text-white rounded-r-xl">
          Send
        </button>
      </div>
    </div>
  );
}
