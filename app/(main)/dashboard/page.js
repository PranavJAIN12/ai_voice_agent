import React from 'react'
import FeatureAssistant from './_components/FeatureAssistant'
import History from './_components/History'
import Feedback from './_components/Feedback'

const Dashboard = () => {
  return (
    <div>
      <FeatureAssistant/>
      <div className='flex justify-between'>
        <History/>
        <Feedback/>
      </div>
    </div>
  )
}

export default Dashboard
