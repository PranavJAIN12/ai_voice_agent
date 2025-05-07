"use client";
import { UserContext } from "@/app/_context/UserContext";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { ExpertsList } from "@/services/options";
import { useConvex } from "convex/react";
import moment from "moment";
import Image from "next/image";
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
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Feedback</h1>

      {discussionRoomData.length === 0 ? (
        <div className="text-gray-500 text-center mt-10">
          <p>You don't have any previous feedback.</p>
        </div>
      ) : (
        <div className="">
          {discussionRoomData
            .filter((data) => validCoachingTypes.includes(data.coachingOption))
            .map((data, index) => (
              <div
                key={index}
                className="bg-white shadow-md rounded-xl p-5 border border-gray-200 hover:shadow-lg transition group flex justify-around items-center mb-8"
              >
                <div>
                  <Image
                    src={getAbstractImg(data.coachingOption)}
                    height={70}
                    width={70}
                    alt="abstract img"
                    className="rounded-4xl object-cover "
                  />
                </div>
                <div className="ml-3 ">

                <h2 className="text-xl font-semibold mb-2 capitalize ">{data.topic}</h2>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Coaching Type:</span> {data.coachingOption}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Expert:</span> {data.expertName || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Created</span> { moment(data._creationTime).fromNow() || "N/A"}
                </p>
                </div>
                <Button className="ml-3 invisible group-hover:visible">View Feedback</Button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Feedback;
