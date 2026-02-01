import React from 'react'
import AppHeader from './_components/AppHeader'
import { Toaster } from 'sonner'

const DashboardLayout = ({children}) => {
  return (
    <div>
      <AppHeader/>
      {children}
      <Toaster position='top-center' richColors/>
    </div>
  )
}

export default DashboardLayout
