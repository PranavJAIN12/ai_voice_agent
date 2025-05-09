"use client"
import { api } from '@/convex/_generated/api';
import { useConvex, useQuery } from 'convex/react';
import { useParams } from 'next/navigation'
import React from 'react'

const page = () => {

    const {roomid} = useParams();

    const viewSummaryData = useQuery(api.DiscussionRoom.GetDiscussionRoom, {
        id: roomid,
      });
        console.log("viewSummaryData", viewSummaryData);
  return (
    <div>
      summary page
    </div>
  )
}

export default page
