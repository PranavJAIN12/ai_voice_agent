"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ResumeBasedInterviewModel, ResumeBasedInterviewSummary } from "@/services/globalSer";
import { Button } from "@/components/ui/button";
import { UserButton } from "@stackframe/stack";
import { Loader } from "lucide-react";

const Page = () => {
  const router = useRouter();
  const { roomid } = useParams();

  // --------------------- Data Fetching ---------------------
  const resumeBasedInterviewData = useQuery(
    api.ResumeBasedDiscussionRoom.GetResumeBasedDiscussionRoom,
    { id: roomid }
  );
  const updateConversation = useMutation(api.ResumeBasedDiscussionRoom.updateConversation)

  // --------------------- State Management ---------------------
  const [messages, setMessages] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [RecordRTCInstance, setRecordRTCInstance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null)
   const [enableFeedback, setEnableFeedback] = useState(false);
  const recognitionRef = useRef(null);
  const micStreamRef = useRef(null);
  const messagesEndRef = useRef(null);
  let silenceTimeout = null;

  useEffect(() => {
    const loadRecorder = async () => {
      const mod = await import("recordrtc");
      setRecordRTCInstance(() => mod.default);
    };
    loadRecorder();
  }, []);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --------------------- Speech Recognition Setup ---------------------
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      isConnected &&
      resumeBasedInterviewData
    ) {
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
          setLoading(true);

          try {
            const fullConversation = messages
              .map(
                (msg) => `${msg.sender === "user" ? "User" : "AI"}: ${msg.text}`
              )
              .join("\n");
            const airesponse = await ResumeBasedInterviewModel(
              `You are a technical interviewer conducting a mock interview. 
   Based on this resume: ${resumeBasedInterviewData?.data}, 
   ask one question at a time. DO NOT parse or summarize the resume. 
   DO NOT output JSON. Just ask an interview question suitable to the candidate's resume. 
   Start by asking the candidate to introduce themselves. Continue this interview. Here's the context:\n${fullConversation}\nNow the user said: "${spoken}". Respond accordingly.`,
              spoken
            );

            console.log("ai response:", airesponse);

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
  }, [isConnected, resumeBasedInterviewData, messages]);

  const speakResponse = (text) => {
    if (!text) return;

    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1.2;

    const setVoice = () => {
      const voices = synth.getVoices();
      const femaleVoice =
        voices.find((v) => /female/i.test(v.name)) ||
        voices.find((v) => v.name.includes("Google US English")) ||
        voices.find((v) => v.name.includes("Microsoft Zira")) ||
        voices.find((v) => v.lang === "en-US");

      const maleVoice =
        voices.find((v) => v.name.includes("Google UK English Male")) ||
        voices.find((v) => v.name.includes("Microsoft David")) ||
        voices.find((v) => v.name.includes("Microsoft Mark")) ||
        voices.find((v) => v.name.includes("Alex")) ||
        voices.find((v) => v.name.includes("Fred")) ||
        voices.find((v) => v.lang === "en-US");

      if (resumeBasedInterviewData?.expertName === "Joanna") {
        utterance.voice = femaleVoice;
      }
      if (resumeBasedInterviewData?.expertName === "Matthew") {
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

    if (!resumeBasedInterviewData) {
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

    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      console.log("Recognition stopped.");
    }

    if (silenceTimeout) {
      clearTimeout(silenceTimeout);
      silenceTimeout = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
      console.log("Mic stream stopped.");
    }

    setLoading(false);
    setEnableFeedback(true);
    generateFeedback();
    await updateConversation({
      id: resumeBasedInterviewData._id,
      conversation: messages
    })
  };


const generateFeedback = async () => {
  const aiFeedback = await ResumeBasedInterviewSummary(
    `You are a technical interviewer providing summary after a interview based on the conversation of ${messages} `,
    messages
  );
  console.log("ai feedback", aiFeedback);

  // Extract feedback text from Gemini API response
  let feedbackText = "";
  if (aiFeedback && aiFeedback.parts && aiFeedback.parts.length > 0) {
    feedbackText = aiFeedback.parts[0].text;
  } else if (typeof aiFeedback === "string") {
    feedbackText = aiFeedback;
  } else {
    feedbackText = "No feedback generated.";
  }

  setFeedback(feedbackText);
};

  if (!resumeBasedInterviewData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading interview room...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 md:py-8 max-w-7xl">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {resumeBasedInterviewData?.coachingOption}{" "}
                <span className="text-gray-500 dark:text-gray-400">Interview</span>
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Topic: {resumeBasedInterviewData?.topic} • Expert: {resumeBasedInterviewData?.expertName} 
              </p>
            </div>
            <div className="hidden sm:block">
              <UserButton />
            </div>
          </div>
        </div>

        {/* Main Interview Section */}
        <div className="flex flex-col lg:flex-row h-[600px] lg:h-[700px]">
          {/* Video/Expert Section */}
          <div className="flex-1 bg-gray-50 dark:bg-gray-800 relative flex flex-col">
            {/* Expert Avatar */}
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <div className="text-center">
                <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 ${
                  isConnected ? 'border-green-400 shadow-lg shadow-green-200' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 mb-4 transition-all duration-300`}>
                  <div className={`w-full h-full bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold ${
                    isConnected ? 'animate-pulse' : ''
                  }`}>
                    {resumeBasedInterviewData?.expertName?.charAt(0) || 'E'}
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {resumeBasedInterviewData?.expertName || "Expert"}
                </h2>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isConnected 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                  }`}></div>
                  {isConnected ? "Connected & Listening" : "Ready to Connect"}
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-center space-x-4">
                {!isConnected ? (
                  <Button
                    onClick={handleConnect}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg shadow-md transition-all duration-200 flex items-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader size={20} className="mr-2 animate-spin" />
                    ) : (
                      <div className="w-5 h-5 mr-2 bg-white rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                    Start Interview
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={disconnect}
                    className="font-medium py-3 px-8 rounded-lg shadow-md transition-all duration-200 flex items-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader size={20} className="mr-2 animate-spin" />
                    ) : (
                      <div className="w-5 h-5 mr-2 bg-white rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-red-600 rounded-square"></div>
                      </div>
                    )}
                    End Interview
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile User Button */}
            <div className="sm:hidden absolute top-4 right-4">
              <UserButton />
            </div>
          </div>

          {/* Conversation Panel */}
          <div className="w-full lg:w-96 bg-white dark:bg-gray-900 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Conversation Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">Live Conversation</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {messages.length} messages exchanged
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Click "Start Interview" to begin your conversation
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.isAI ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`rounded-2xl py-3 px-4 text-sm max-w-[85%] shadow-sm ${
                          msg.isAI
                            ? "bg-blue-500 text-white rounded-bl-md"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-br-md"
                        }`}
                      >
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-blue-500 text-white rounded-2xl rounded-bl-md py-3 px-4 shadow-sm">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Live Transcript */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Live Transcript:
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic min-h-[20px]">
                    {isConnected ? (transcript || "Listening...") : "Not connected"}
                  </p>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">💡 Interview Tip:</p>
                  <p>Speak clearly and pause briefly between thoughts. We'll provide detailed feedback at the end!</p>
                </div>
              </div>
              {enableFeedback && (

              <div className="feedback">
                <h1>Feedback: {feedback}</h1>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;