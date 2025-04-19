"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { getToken } from "@/services/globalSer";
import { ExpertName } from "@/services/options";
import { UserButton } from "@stackframe/stack";
import dynamic from "next/dynamic";

let silenceTimeout = null;

const DiscussionRoom = () => {
  const { roomid } = useParams();
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, {
    id: roomid,
  });

  const [expert, setExpert] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [RecordRTCInstance, setRecordRTCInstance] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const loadRecorder = async () => {
      const mod = await import("recordrtc");
      setRecordRTCInstance(() => mod.default);
    };
    loadRecorder();
  }, []);

  useEffect(() => {
    if (DiscussionRoomData) {
      const matchedExpert = ExpertName.find(
        (item) =>
          item.name.toLowerCase() ===
          DiscussionRoomData.expertName?.toLowerCase()
      );
      setExpert(matchedExpert || null);
    }
  }, [DiscussionRoomData]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
          const spoken = event.results[event.results.length - 1][0].transcript;
          setTranscript(spoken);

          // Optional: Add to message history
          setMessages((prev) => [
            ...prev,
            { sender: "user", text: spoken, isAI: false },
          ]);
        };

        recognition.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
        };

        recognition.onend = () => {
          if (isConnected) recognition.start(); // Auto-restart if connected
        };

        recognitionRef.current = recognition;
      } else {
        console.warn("Web Speech API not supported in this browser.");
      }
    }
  }, [isConnected]);

  const handleConnect = async () => {
    if (!RecordRTCInstance) {
      console.error("RecordRTC not yet loaded.");
      return;
    }

    recognitionRef.current?.start();
    setIsConnected(true);
  };

  const disconnect = async (e) => {
    e.preventDefault();
    setIsConnected(false);
    recognitionRef.current?.stop();
    clearTimeout(silenceTimeout);
  };

  if (!RecordRTCInstance) {
    return (
      <div className="text-center py-20">Loading microphone module...</div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto mt-8 px-6 md:px-8">
      <h1 className="text-xl font-semibold mb-4">Mockup Interview</h1>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Main interview area */}
        <div className="w-full md:w-4/5 bg-gray-100 rounded-xl overflow-hidden relative min-h-[500px] flex flex-col items-center justify-center">
          {expert && (
            <div className="flex flex-col items-center mt-8">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img
                  src={expert.image || "/placeholder-expert.jpg"}
                  alt={expert.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="mt-2 text-center">{expert.name || "Expert"}</p>
            </div>
          )}

          {/* Self view */}
          <div className="absolute bottom-4 right-4 border-2 p-5 px-9 bg-gray-300 rounded-xl">
            <UserButton />
          </div>

          {/* Connect button */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            {!isConnected ? (
              <Button
                onClick={handleConnect}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-full"
              >
                Connect Now
              </Button>
            ) : (
              <Button variant={"destructive"} onClick={disconnect}>
                Disconnect
              </Button>
            )}
          </div>
        </div>

        {/* Chat + transcript */}
        <div className="w-full md:w-1/5 bg-white rounded-xl p-4 flex flex-col h-[500px]">
          <div className="flex-1 overflow-y-auto space-y-3">
            {messages.map((msg, index) => (
              <div key={index} className="flex mb-3">
                <div
                  className={`${
                    msg.isAI
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  } rounded-xl py-2 px-4 text-sm max-w-full`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs text-gray-500 px-2">
            <strong>Live Transcript:</strong> {transcript || "—"}
          </div>

          <div className="mt-2 text-xs text-gray-500 px-2">
            At the end of the conversation, we’ll automatically generate feedback/notes.
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionRoom;
