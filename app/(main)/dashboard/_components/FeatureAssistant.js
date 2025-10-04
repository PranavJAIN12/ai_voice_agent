"use client";
import { Button } from "@/components/ui/button";
import { ExpertsList } from "@/services/options";
import { useUser } from "@stackframe/stack";
import React from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import UserImputDial from "./UserImputDial";
import ProfileDialog from "./ProfileDialog";
import ResMockInterview from "./ResMockInterview";
import ResumeMockInterviewDialog from "./ResMockInterview";
import AtsScoreCheck from "./AtsScoreCheck";

const FeatureAssistant = () => {
  const user = useUser();
  const name = user?.displayName || "User";

  return (
    <div className="w-full max-w-7xl mx-auto mt-8 px-6 md:px-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">My Workspace</p>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            Welcome Back, {name}
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
          </h1>
        </div>
        <ProfileDialog>
          <Button
            variant="outline"
            className="mt-4 md:mt-0 flex items-center gap-2"
          >
            Profile Settings
            <ChevronRight className="h-4 w-4" />
          </Button>
        </ProfileDialog>
      </header>

      {/* Experts Grid with CSS Animation */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Choose Your Lecture Type</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {ExpertsList.map((option, index) => (
            <UserImputDial key={index} coachingOpt={option}>
              <div
                className="border-3 rounded-xl p-4 hover:shadow-md transition-all duration-300 flex flex-col items-center cursor-pointer hover:-translate-y-1"
                style={{
                  animationName: "fadeInUp",
                  animationDuration: "0.5s",
                  animationFillMode: "both",
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div className="relative mb-3 group">
                  <Image
                    src={option.image}
                    alt={option.name}
                    height={90}
                    width={90}
                    className="rounded-full object-cover transition-all duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 rounded-full bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                </div>
                <p className="font-medium text-center">{option.name}</p>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {option.specialty || ""}
                </p>
              </div>
            </UserImputDial>
          ))}
        </div>
        {/* <ResMockInterview/> */}

        <div className="my-8 rounded-2xl border p-6 shadow-md bg-muted/40 relative overflow-hidden">
          <div className="absolute top-0 left-0 bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-br-lg shadow-sm">
            🚀 New Feature
          </div>

          <h1 className="text-2xl font-bold mb-2">Resume Based Interview</h1>
          <p className="text-muted-foreground mb-4">
            Get personalized interview questions based on your resume to boost
            your preparation.
          </p>

          <ResumeMockInterviewDialog>
            <Button className="cursor-pointer">Start Resume Interview</Button>
          </ResumeMockInterviewDialog>
        </div>
         <div className="my-8 rounded-2xl border p-6 shadow-md bg-muted/40 relative overflow-hidden">
          <div className="absolute top-0 left-0 bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-br-lg shadow-sm">
            🚀 New Feature
          </div>

          <h1 className="text-2xl font-bold mb-2">Check ATS Score</h1>
          <p className="text-muted-foreground mb-4">
            Get yoyr resume ATS Score using AI now.
          </p>

          <AtsScoreCheck>
            <Button className="cursor-pointer">Check now</Button>
          </AtsScoreCheck>
        </div>
      </section>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default FeatureAssistant;
