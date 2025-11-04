"use client";
import { useState } from "react";
import ChatBot from "./ChatBot";

export default function ChatButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && <ChatBot />}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition"
      >
        💬
      </button>
    </>
  );
}
