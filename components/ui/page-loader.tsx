'use client'

import React from 'react'
import { Loader } from './loader'

interface PageLoaderProps {
  isLoading: boolean
  text?: string
  className?: string
}

export const PageLoader: React.FC<PageLoaderProps> = ({ 
  isLoading, 
  text = 'NESTER',
  className = '' 
}) => {
  if (!isLoading) return null

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm ${className}`}>
      <div className="flex flex-col items-center justify-center">
        <Loader text={text} />
      </div>
    </div>
  )
}

export default PageLoader