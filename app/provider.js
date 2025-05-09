
"use client"
import React, { Suspense } from 'react'
import { ConvexProvider, ConvexReactClient } from "convex/react";
import AuthProvider from './AuthProvider';

const Provider = ({ children }) => {
    const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-32 w-full">
  <div className="flex items-center gap-3">
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-transparent dark:border-t-transparent"></div>
    <p className="text-sm text-muted-foreground">Loading...</p>
  </div>
</div>
}>
        <ConvexProvider client={convex}>
<AuthProvider>

      {children}
</AuthProvider>
        </ConvexProvider>
    </Suspense>
  )
}

export default Provider
