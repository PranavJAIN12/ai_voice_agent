"use client";
import { useContext, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { ExpertName } from "@/services/options";
import { UserButton } from "@stackframe/stack";
import {
  AIModel,
  AIModelToGenerateFeedbackAndNotes,
} from "@/services/globalSer";
import { Loader } from "lucide-react";
import Markdown from "react-markdown";
import { UserContext } from "@/app/_context/UserContext";
import { useRouter } from "next/navigation";

let silenceTimeout = null;

const DiscussionRoom = () => {
  const router = useRouter();
  const { roomid } = useParams();
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, {
    id: roomid,
  });

  const [expert, setExpert] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [RecordRTCInstance, setRecordRTCInstance] = useState(null);
  const recognitionRef = useRef(null);
  const micStreamRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [enableFeedback, setEnableFeedback] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const messagesEndRef = useRef(null);
  const { userData, setUserData } = useContext(UserContext);

  const updateConversation = useMutation(api.DiscussionRoom.updateConversation);
  const updateSummary = useMutation(api.DiscussionRoom.updateSummary);
  const updateCredits = useMutation(api.users.updateCredits);
  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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

          if (userData?.credits == 0) {
            recognition.stop();
            recognitionRef.current.stop();
            alert(
              "Tokens Finished, Please purchase new credits for further chat"
            );
            // router.push('/dashboard')
            return;
          }

          setMessages((prev) => [
            ...prev,
            { sender: "user", text: spoken, isAI: false },
          ]);
          setLoading(true);

          try {
            const airesponse = await AIModel(
              DiscussionRoomData.topic,
              DiscussionRoomData.coachingOption,
              spoken
            );
            console.log("ai response:", airesponse);
            // await updateUserCreditMethod(airesponse)

            // Extract text from the AI response consistently
            let aiText;
            if (airesponse.parts && airesponse.parts.length > 0) {
              aiText = airesponse.parts[0].text;
            } else if (airesponse.content) {
              aiText = airesponse.content;
            } else if (airesponse.text) {
              aiText = airesponse.text;
            } else {
              aiText = "No response from AI.";
            }

            setMessages((prev) => [
              ...prev,
              { sender: "ai", text: aiText, isAI: true },
            ]);
            setLoading(false);
            speakResponse(aiText);
            await updateUserCreditMethod(aiText);
          } catch (error) {
            console.error("AI error:", error);
            setMessages((prev) => [
              ...prev,
              {
                sender: "ai",
                text: "Sorry, I encountered an error processing your response.",
                isAI: true,
              },
            ]);
            setLoading(false);
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

  const speakResponse = (text) => {
    if (!text) return;

    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1.2;

    // Wait for voices to be loaded
    const setVoice = () => {
      const voices = synth.getVoices();
      const femaleVoice =
        voices.find((v) => /female/i.test(v.name)) || // Try name-based match
        voices.find((v) => v.name.includes("Google US English")) || // Chrome
        voices.find((v) => v.name.includes("Microsoft Zira")) || // Edge
        voices.find((v) => v.lang === "en-US"); // Fallback

      const maleVoice =
        voices.find((v) => v.name.includes("Google UK English Male")) ||
        voices.find((v) => v.name.includes("Microsoft David")) ||
        voices.find((v) => v.name.includes("Microsoft Mark")) ||
        voices.find((v) => v.name.includes("Alex")) || // macOS
        voices.find((v) => v.name.includes("Fred")) || // macOS
        voices.find((v) => v.lang === "en-US"); // Fallback

      if (DiscussionRoomData.expertName === "Joanna") {
        utterance.voice = femaleVoice;
      }
      if (DiscussionRoomData.expertName === "Matthew") {
        utterance.voice = maleVoice;
      }

      synth.speak(utterance);
    };

    if (synth.getVoices().length === 0) {
      synth.onvoiceschanged = setVoice;
    } else {
      setVoice();
    }
  };

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
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const disconnect = async (e) => {
    e.preventDefault();
    setIsConnected(false);
    setLoading(true);

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

    await updateConversation({
      id: DiscussionRoomData._id,
      conversation: messages,
    });

    setEnableFeedback(true);
    await generateFeedback();
    setLoading(false);
    alert(`you are left with ${userData.credits} Credits`);
  };

  const generateFeedback = async () => {
    console.log("feedback gen");

    try {
      const feedback = await AIModelToGenerateFeedbackAndNotes(
        DiscussionRoomData.coachingOption,
        messages
      );

      let aiFeedback;
      if (feedback.parts && feedback.parts.length > 0) {
        aiFeedback = feedback.parts[0].text;
      } else if (feedback.content) {
        aiFeedback = feedback.content;
      } else if (feedback.text) {
        aiFeedback = feedback.text;
      } else {
        aiFeedback = "No feedback from AI.";
      }

      setFeedback(aiFeedback);
      //   console.log("feedback:", aiFeedback);

      await updateSummary({
        id: DiscussionRoomData._id,
        summary: aiFeedback, // Fixed variable name (was aifeedback)
      });
    } catch (error) {
      console.log("feedback error", error);
    }
  };

  const updateUserCreditMethod = async (text) => {
    if (typeof text !== "string") return;

    const userToken = text.trim() ? text.trim().split(/\s+/).length : 0;
    const newCredits = Math.max(Number(userData.credits) - userToken, 0);

    await updateCredits({
      id: userData._id,
      credits: newCredits,
    });

    setUserData((prev) => ({
      ...prev,
      credits: newCredits,
    }));
  };

  const isLoading = !DiscussionRoomData || !RecordRTCInstance;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-500" />
          <p className="text-gray-600">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 md:py-8">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800">
          <h1 className="text-lg sm:text-xl font-semibold">
            {DiscussionRoomData.coachingOption}{" "}
            <span className="text-gray-500 dark:text-gray-400">on topic</span>{" "}
            {DiscussionRoomData.topic}{" "}
            <span className="text-gray-500 dark:text-gray-400">
              with Expert
            </span>{" "}
            {DiscussionRoomData.expertName}
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Main interview area */}
          <div className="w-full lg:w-3/4 bg-gray-100 dark:bg-gray-800 relative min-h-[400px] md:min-h-[500px] flex flex-col">
            {/* Expert display */}
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              {expert && (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-md">
                    <img
                      src={expert.image || "/placeholder-expert.jpg"}
                      alt={expert.name}
                      className={`w-full h-full object-cover ${
                        isConnected ? "animate-pulse" : ""
                      }`}
                    />
                  </div>
                  <p className="mt-3 text-lg font-medium">
                    {expert.name || "Expert"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isConnected ? "Connected" : "Waiting to connect..."}
                  </p>
                </div>
              )}
            </div>

            {/* Self view */}
            <div className="absolute bottom-4 right-4 border-2 border-white dark:border-gray-700 p-3 sm:p-4 bg-gray-200 dark:bg-gray-700 rounded-xl shadow-md">
              <UserButton />
            </div>

            {/* Connect/Disconnect button */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              {!isConnected ? (
                <Button
                  onClick={handleConnect}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-full shadow-md"
                  disabled={loading}
                >
                  Connect Now{" "}
                  {loading && (
                    <Loader size={18} className="ml-2 animate-spin" />
                  )}
                </Button>
              ) : (
                <Button
                  variant={"destructive"}
                  onClick={disconnect}
                  className="font-medium py-2 px-6 rounded-full shadow-md"
                  disabled={loading}
                >
                  End Session{" "}
                  {loading && (
                    <Loader size={18} className="ml-2 animate-spin" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Chat + transcript */}
          <div className="w-full lg:w-1/4 bg-white dark:bg-gray-900 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-800 flex flex-col h-[400px] lg:h-auto">
            <div className="p-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-medium text-sm">Conversation</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                    Your conversation will appear here
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.isAI ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`rounded-xl py-2 px-3 text-sm max-w-[85%] ${
                          msg.isAI
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="p-3 border-t border-gray-100 dark:border-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <div className="font-medium mb-1">Live Transcript:</div>
                <div className="italic">{transcript || "Listening..."}</div>
              </div>

              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                At the end of the conversation, we'll automatically generate
                feedback and notes.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback section */}
      {enableFeedback && (
        <div className="mt-6 space-y-6">
          {feedback && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-5 shadow-sm">
              <h2 className="text-lg font-semibold mb-3 flex items-center text-green-800 dark:text-green-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Expert Feedback
              </h2>
              <div className="prose dark:prose-invert max-w-none text-green-800 dark:text-green-200">
                <Markdown>{feedback}</Markdown>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              Complete Conversation
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-2 max-h-[400px] overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No conversation data available.
                </p>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <div key={index} className="flex flex-col">
                      <div className="text-xs font-medium text-gray-500 mb-1">
                        {msg.isAI ? "Expert:" : "You:"}
                      </div>
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-sm">
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionRoom;
