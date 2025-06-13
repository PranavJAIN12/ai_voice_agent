"use client"
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { useParams, useRouter } from 'next/navigation'
import React from 'react'

const page = () => {

    const router = useRouter();
    const {roomid} = useParams();
    const resumeBasedInterviewData = useQuery(api.ResumeBasedDiscussionRoom.GetResumeBasedDiscussionRoom,{
        id: roomid,
    })
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 md:py-8">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">

    <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800">
          <h1 className="text-lg sm:text-xl font-semibold">
            {resumeBasedInterviewData?.coachingOption}{" "}
            <span className="text-gray-500 dark:text-gray-400">on File Name</span>{" "}
            {resumeBasedInterviewData?.topic}{" "}
            <span className="text-gray-500 dark:text-gray-400">
              with Expert
            </span>{" "}
            {resumeBasedInterviewData?.expertName}
          </h1>
        </div>
        <div className='interview section'>
          <h1>Interview section</h1>
        </div>
      </div>
    </div>
  )
}

export default page
