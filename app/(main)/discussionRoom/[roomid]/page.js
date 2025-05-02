"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { ExpertName } from "@/services/options";
import { UserButton } from "@stackframe/stack";
import { AIModel, AIModelToGenerateFeedbackAndNotes } from "@/services/globalSer";
import { Loader } from "lucide-react";

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
  const micStreamRef = useRef(null);
  const [loading, setLoading] = useState(false)
  const [enableFeedback, setEnableFeedback] = useState(false);
  const [feedback, setFeedback] = useState(null);


  const updateConversation = useMutation(api.DiscussionRoom.updateConversation)

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
    // Only set up speech recognition when we're connected AND have room data
    if (typeof window !== "undefined" && isConnected && DiscussionRoomData) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = async (event) => {
          const spoken = event.results[event.results.length - 1][0].transcript;
          setTranscript(spoken);
        
          setMessages((prev) => [
            ...prev,
            { sender: "user", text: spoken, isAI: false },
          ]);
        setLoading(true)
          
          try {
            const airesponse = await AIModel(
              DiscussionRoomData.topic,
              DiscussionRoomData.coachingOption,
              spoken
            );
            console.log("ai response:", airesponse)
            // const aiText = airesponse.content || airesponse.text;
            const aiText = airesponse.parts?.[0]?.text || "No response from AI.";

            
            setMessages((prev) => [
              ...prev,
              { sender: "ai", text: airesponse.content || airesponse.text, isAI: true },
            ]);
            speakResponse(aiText)
          } catch (error) {
            console.error("AI error:", error);
            setMessages((prev) => [
              ...prev,
              { sender: "ai", text: "Sorry, I encountered an error processing your response.", isAI: true },
            ]);
            // console.log("sliced",msg.slice(-2));
            // console.log(messages)
          }
        };
        
        recognition.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
        };

        recognition.onend = () => {
          if (isConnected) recognition.start();
        };

        recognitionRef.current = recognition;
        recognition.start();
        
        return () => {
          recognition.onend = null;
          recognition.stop();
        };
      } else {
        console.warn("Web Speech API not supported in this browser.");
      }
    }
  }, [isConnected, DiscussionRoomData]);

const speakResponse = (text)=>{
  const utterance = new SpeechSynthesisUtterance(text);
utterance.pitch = 1.2; // 0 to 2 (normal = 1)
utterance.rate = 1;    // 0.1 to 10 (normal = 1)
utterance.voice = speechSynthesis.getVoices()[0]; // pick a specific voice
speechSynthesis.speak(utterance);
}

  const handleConnect = async () => {
    if (!RecordRTCInstance) {
      console.error("RecordRTC not yet loaded.");
      return;
    }

    // Only allow connection if room data is loaded
    if (!DiscussionRoomData) {
      console.error("Room data not yet loaded. Please wait.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      setIsConnected(true);
      console.log("Mic started");
      // setLoading(true)
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const disconnect = async (e) => {
    e.preventDefault();
    setIsConnected(false);
    setLoading(true)
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      console.log("Recognition stopped.");
    }

    clearTimeout(silenceTimeout);
    silenceTimeout = null;

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
      console.log("Mic stream stopped.");
    }
    setLoading(false)
    await updateConversation({
      id: DiscussionRoomData._id,
      conversation:messages
    })

    setEnableFeedback(true)

    const feedback = await AIModelToGenerateFeedbackAndNotes(
      DiscussionRoomData.coachingOption,
      messages
    );
    const aiFeedback = feedback.parts?.[0]?.text || "No feedback from AI.";
    setFeedback(aiFeedback);
    console.log("feedback:", aiFeedback)
    
  };

  const isLoading = !DiscussionRoomData || !RecordRTCInstance;

  if (isLoading) {
    return (
      <div className="text-center py-20">Loading resources...</div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto mt-8 px-6 md:px-8">
      <h1 className="text-xl font-semibold mb-4">Mockup Interview on {DiscussionRoomData.topic} by {DiscussionRoomData.expertName}</h1>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Main interview area */}
        <div className="w-full md:w-4/5 bg-gray-100 rounded-xl overflow-hidden relative min-h-[500px] flex flex-col items-center justify-center">
          {expert && (
            <div className="flex flex-col items-center mt-8">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img
                  src={expert.image || "/placeholder-expert.jpg"}
                  alt={expert.name}
                  className = {`${isConnected? "animate-pulse w-full h-full object-cover" : "w-full h-full object-cover"}`}
                />
              </div>
              <p className="mt-2 text-center">{expert.name || "Expert"}</p>
            </div>
          )}

          {/* Self view */}
          <div className="absolute bottom-4 right-4 border-2 p-5 px-9 bg-gray-300 rounded-xl">
            <UserButton />
          </div>

          {/* Connect/Disconnect button */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            {!isConnected ? (
              <Button
                onClick={handleConnect}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-full"
              >
                Connect Now{loading && <Loader className="animate-spin"/>}
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
            At the end of the conversation, we'll automatically generate feedback/notes.
            {feedback && (
  <div className="mt-4 p-4 bg-yellow-100 rounded-md text-sm text-gray-800">
    <strong>AI Feedback:</strong>
    <p>{feedback}</p>
  </div>
)}

          
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionRoom;