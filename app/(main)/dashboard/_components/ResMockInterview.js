


import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const ResMockInterview = () => {
  return (
    <div>
      
<Card>
  <CardHeader>
   <CardTitle>
  📄 Resume-Based Mock Interview
  <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-400 text-black rounded-full">New</span>
</CardTitle>

  </CardHeader>
  <CardContent>
    <p>Upload your resume and get personalized AI interview questions based on it.</p>
    <Link href="/mock-interview/resume">
      <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Try Now</button>
    </Link>
  </CardContent>
</Card>

    </div>
  )
}

export default ResMockInterview
