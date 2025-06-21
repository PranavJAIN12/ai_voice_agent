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

const Feedback = () => {
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
    "Question & Preparation"
  ];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6" id="feedback-section">
  
      <h1 className="text-3xl font-bold mb-2 t">Expert Feedback</h1>
      <p className="dark:text-gray-300 text-gray-600 mb-8">Review feedback provided by experts on your previous sessions</p>

      {discussionRoomData.length === 0 ? (
        <div className=" rounded-xl shadow-sm border border-gray-300 dark:border-gray-700 p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium  mb-2">No feedback available</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            You haven't received any feedback yet. Complete a session to get expert insights on your performance.
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
                <div className="p-5">
                  <div className="flex items-center mb-4">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                      <Image
                        src={getAbstractImg(data.coachingOption)}
                        height={80}
                        width={80}
                        alt={`${data.coachingOption} icon`}
                        className="object-cover h-full w-full"
                      />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-lg font-semibold capitalize">{data.topic}</h2>
                      <p className="text-sm text-gray-500">
                        {moment(data._creationTime).format("MMM D, YYYY")} ({moment(data._creationTime).fromNow()})
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4 pb-2 ">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start ">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase dark:text-gray-300">Coaching Type</p>
                          <p className="text-gray-700 dark:text-gray-500">{data.coachingOption}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase dark:text-gray-300">Expert</p>
                          <p className="text-gray-700 dark:text-gray-500">{data.expertName || "Not assigned"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className=" px-5 py-3 flex justify-end border-t border-gray-100">
                  <Link href={"/view-summary/"+ data._id}>
                  <Button 
                    className=" bg-gray-100 text-gray-800 border border-gray-200 flex items-center cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Feedback
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

export default Feedback;