"use client";
import { UserContext } from "@/app/_context/UserContext";
import { api } from "@/convex/_generated/api";
import { ExpertsList } from "@/services/options";
import { useConvex } from "convex/react";
import Image from "next/image";
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
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Your Previous Lectures</h1>

      {discussionRoomData.length === 0 ? (
        <div className="text-gray-500 text-center mt-10">
          <p>You don't have any previous lectures.</p>
        </div>
      ) : (
        <div className="">
          {discussionRoomData
            .filter((data) => validCoachingTypes.includes(data.coachingOption))
            .map((data, index) => (
              <div
                key={index}
                className="bg-white shadow-md rounded-xl p-5 border border-gray-200 hover:shadow-lg transition"
              >
                <div className="mb-4">
                  <Image
                    src={getAbstractImg(data.coachingOption)}
                    height={70}
                    width={70}
                    alt="abstract img"
                    className="rounded-md object-cover"
                  />
                </div>
                <h2 className="text-xl font-semibold mb-2 capitalize">{data.topic}</h2>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Coaching Type:</span> {data.coachingOption}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Expert:</span> {data.expertName || "N/A"}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default History;
