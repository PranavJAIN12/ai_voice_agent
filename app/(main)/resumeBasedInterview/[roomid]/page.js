"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ResumeBasedInterviewModel } from "@/services/globalSer";
import { Button } from "@/components/ui/button";

// Component
const Page = () => {
  const router = useRouter();
  const { roomid } = useParams();

  // --------------------- Data Fetching ---------------------
  const resumeBasedInterviewData = useQuery(
    api.ResumeBasedDiscussionRoom.GetResumeBasedDiscussionRoom,
    { id: roomid }
  );

  // --------------------- State Management ---------------------
  const [messages, setMessages] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [RecordRTCInstance, setRecordRTCInstance] = useState(null);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);
  const micStreamRef = useRef(null);

  useEffect(() => {
    const loadRecorder = async () => {
      const mod = await import("recordrtc");
      setRecordRTCInstance(() => mod.default);
    };
    loadRecorder();
  }, []);

  // --------------------- Speech Recognition Setup ---------------------
  useEffect(() => {
    // Only set up speech recognition when we're connected AND have room data
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
          //  setLoading(true);

          try {
            const airesponse = await ResumeBasedInterviewModel(
              `You are a technical interviewer conducting a mock interview. 
   Based on this resume: ${resumeBasedInterviewData?.data}, 
   ask one question at a time. DO NOT parse or summarize the resume. 
   DO NOT output JSON. Just ask an interview question suitable to the candidate's resume. 
   Start by asking the candidate to introduce themselves.`,
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
            //  setLoading(false);
            speakResponse(aiText);
            //  await updateUserCreditMethod(aiText);
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
            //  setLoading(false);
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
  }, [isConnected, resumeBasedInterviewData]);

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

      if (resumeBasedInterviewData.expertName === "Joanna") {
        utterance.voice = femaleVoice;
      }
      if (resumeBasedInterviewData.expertName === "Matthew") {
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

    clearTimeout(silenceTimeout);
    silenceTimeout = null;

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
      console.log("Mic stream stopped.");
    }

    // setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 md:py-8">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800">
          <h1 className="text-lg sm:text-xl font-semibold">
            {resumeBasedInterviewData?.coachingOption}{" "}
            <span className="text-gray-500 dark:text-gray-400">
              on File Name
            </span>{" "}
            {resumeBasedInterviewData?.topic}{" "}
            <span className="text-gray-500 dark:text-gray-400">
              with Expert
            </span>{" "}
            {resumeBasedInterviewData?.expertName}
          </h1>
        </div>

        {/* Main Section */}
        <div className="interview section p-4">
          <h1 className="text-xl font-medium mb-2">Interview Section</h1>
          {/* TODO: Add message rendering / interaction components */}
        </div>
      </div>
      <Button onClick={handleConnect}>Connect</Button>
      <Button onClick={disconnect}>Disconnect</Button>

      <div>
        {messages.map((item,index)=>(
          <div key={index}>
            <p>{item.text}</p>
            </div>
        ))}
      </div>
      
      {/* <h1>{transcript}</h1> */}
    </div>
  );
};

export default Page;
