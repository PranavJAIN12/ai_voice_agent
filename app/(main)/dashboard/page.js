import React from 'react'
import FeatureAssistant from './_components/FeatureAssistant'
import History from './_components/History'
import Feedback from './_components/Feedback'
import ChatButton from '../_components/ChatButton'
import ChatBot from '../_components/ChatBot'

const Dashboard = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Feature Assistant takes full width */}
      <div className="mb-8 sm:mb-12">
        <FeatureAssistant/>
      </div>
      
      {/* History and Feedback components - stacked on mobile, side by side on larger screens */}
      <div className="flex flex-col lg:flex-row lg:space-x-30 space-y-10 lg:space-y-0">
        <div className="w-full lg:w-3/5">
          <History/>
        </div>
        <div className="w-full lg:w-2/5">
          <Feedback/>
          <h1>hello</h1>
          <ChatButton/>
          {/* <ChatBot/> */}
        </div>
      </div>
    </div>
  )
}

export default Dashboard