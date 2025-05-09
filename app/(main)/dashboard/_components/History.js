"use client";
import { UserContext } from "@/app/_context/UserContext";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { ExpertsList } from "@/services/options";
import { useConvex } from "convex/react";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";

const History = () => {
  const convex = useConvex();
  const { userData } = useContext(UserContext);
  const [discussionRoomData, setDiscussionRoomData] = useState([]);

  useEffect(() => {
    userData && getDiscussionRooms();
  }, [userData]);

  const getDiscussionRooms = async () => {
    const result = await convex.query(api.DiscussionRoom.GetAllDiscussionRoom, {
      uid: userData?._id,
    });
    setDiscussionRoomData(result);
  };

  const getAbstractImg = (option) => {
    const coachingOption = ExpertsList.find((item) => item.name === option);
    return coachingOption?.abstract || "/ab1.png";
  };

  const validCoachingTypes = [
    "Topic-Based Lecture",
    "Mock Interview",
    "Question & Preparation",
    "Language Skills Development",
    "Guided Meditation",
  ];

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6">
      <h1 className="text-3xl font-bold mb-2 ">Your Learning History</h1>
      <p className="dark:text-gray-300 text-gray-600 mb-8">Review and access your previous lecture sessions</p>

      {discussionRoomData.length === 0 ? (
        <div className="border border-gray-300 dark:border-gray-700 p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium  mb-2">No lectures yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            You haven't participated in any lectures. Start your learning journey by booking a session.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {discussionRoomData
            .filter((data) => validCoachingTypes.includes(data.coachingOption))
            .map((data, index) => (
              <div
                key={index}
                className=" overflow-hidden rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition duration-300 group"
              >
                <div className="flex p-5 ">
                  <div className="shrink-0">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50">
                      <Image
                        src={getAbstractImg(data.coachingOption)}
                        height={80}
                        width={80}
                        alt={`${data.coachingOption} icon`}
                        className="object-cover h-full w-full"
                      />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h2 className="text-lg font-semibold  line-clamp-1 capitalize mb-1">{data.topic}</h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm dark:text-gray-300 text-gray-600">
                      <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {data.coachingOption}
                      </p>
                      <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {data.expertName || "No expert assigned"}
                      </p>
                      <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {moment(data._creationTime).fromNow()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-5 pb-4 pt-1">
                  <Link href={'/view-summary/'+data._id}>
                  <Button 
                    className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:text-gray-900 transition-colors cursor-pointer"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View notes
                  </Button>
                    </Link>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default History;