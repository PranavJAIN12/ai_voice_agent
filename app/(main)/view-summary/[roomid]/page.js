"use client";
import { api } from "@/convex/_generated/api";
import { ExpertsList } from "@/services/options";
import { useQuery } from "convex/react";
import moment from "moment";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Markdown from "react-markdown";

const page = () => {
  const { roomid } = useParams();
  const [conversationMessages, setConversationMessages] = useState([]);

  const viewSummaryData = useQuery(api.DiscussionRoom.GetDiscussionRoom, {
    id: roomid,
  });
  console.log("viewSummaryData", viewSummaryData);

  const getAbstractImg = (option) => {
    const coachingOption = ExpertsList.find((item) => item.name === option);
    return coachingOption?.abstract || "/ab1.png";
  };

  useEffect(() => {
    if (viewSummaryData?.conversation) {
      const messages = [];

      // Handle array-like object with numeric keys and length property
      const conversation = viewSummaryData.conversation;

      // Check if it's an array-like object
      if (typeof conversation === "object" && conversation.length) {
        for (let i = 0; i < conversation.length; i++) {
          if (conversation[i]) {
            messages.push(conversation[i]);
          }
        }
      }

      setConversationMessages(messages);
    }
  }, [viewSummaryData?.conversation]);

  if (!viewSummaryData) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 md:py-8">
      <div className="outer-header flex flex-row justify-between">
        <div className="nameHeader flex flex-row gap-3.5">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50">
            <Image
              src={getAbstractImg(viewSummaryData?.coachingOption)}
              height={80}
              width={80}
              alt={`${viewSummaryData?.coachingOption} icon`}
              className="object-cover h-full w-full"
            />
          </div>

          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl font-semibold">
              {viewSummaryData?.topic}
            </h1>
            <h1 className="text-lg sm:text-xl font-semibold">
              {viewSummaryData?.coachingOption}
            </h1>
          </div>
        </div>

        <div className="time">
          {moment(viewSummaryData?._creationTime).fromNow()}
        </div>
      </div>

      <div className="main-content mt-9 flex justify-between flex-row gap-4">
        <div className="summary w-[60%]">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-6 shadow-sm">
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
              Feedback/Notes
            </h2>
            <div className="prose dark:prose-invert max-w-none text-green-800 dark:text-green-200">
              <Markdown>{viewSummaryData?.summary}</Markdown>
            </div>
          </div>
        </div>

        <div className="chatbox">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-400 flex items-center">
              {" "}
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
              Conversation
            </h2>
            <div className="space-y-4">
              {conversationMessages.length > 0 ? (
                conversationMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${message.isAI ? "dark:bg-blue-800 bg-blue-50  ml-6" : "bg-gray-50 dark:text-black mr-6"}`}
                  >
                    <p className="font-medium text-sm ">{message.sender}</p>
                    <p>{message.text}</p>
                  </div>
                ))
              ) : (
                <p className=" italic">No conversation messages available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
