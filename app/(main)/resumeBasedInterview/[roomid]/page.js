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
    <div>
      res
      {resumeBasedInterviewData?.expertName}
      {resumeBasedInterviewData?.topic}
    </div>
  )
}

export default page
