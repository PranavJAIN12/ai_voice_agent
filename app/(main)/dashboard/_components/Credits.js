"use client";
import { UserContext } from "@/app/_context/UserContext";
import { useUser } from "@stackframe/stack";
import Image from "next/image";
import React, { useContext } from "react";
import { Progress } from "@/components/ui/progress"


const Credits = () => {
  const { userData } = useContext(UserContext);
  const user = useUser();


  const calculateProgress=()=>{
    if(userData?.subscriptionId){
        // console.log((userData.credits/50000)*100);
        return Number(userData.credits/50000)*100
    }
    
  }
  return (
    <div>
      <div className="userDetails flex my-5">
        <Image
          className="rounded-4xl"
          src={user?.profileImageUrl}
          height={50}
          width={50}
          alt="user img"
        />
        <div className="details ml-4">
          <p className="font-extrabold text-lg">{user.displayName}</p>
          <p className="dark:text-gray-400 text-gray-400">{user.primaryEmail}</p>
        </div>
      </div>
      <hr className="mb-5 dark:bg-white"/>
      <div className="creditsData">
        <h1 className="font-bold">Token Usage</h1>
        <p>{userData?.credits}/{userData?.subscriptionId?'50,000':'5000'}</p>
        <Progress value={calculateProgress()} className="my-3"/>

        <div className="flex justify-between">
            <p>Current Plan</p>
            <p>{userData?.subscriptionId?"Paid Plan ": "Free Plan"}</p>
        </div>

        
        {!userData?.subscriptionId && (
  <button
    className="mt-4   px-4 py-2 rounded-lg  transition"
    onClick={() => {
      // Replace with actual checkout link or function
      window.location.href = "/api/checkout"; // or your Stripe checkout route
    }}
  >
    Upgrade to Pro – $10/month
  </button>
)}


      </div>
    </div>
  );
};

export default Credits;
