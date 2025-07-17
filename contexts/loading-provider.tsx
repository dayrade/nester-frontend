'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { PageLoader } from '@/components/ui/page-loader'

interface LoadingContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  showLoader: (text?: string) => void
  hideLoader: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

interface LoadingProviderProps {
  children: ReactNode
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [loaderText, setLoaderText] = useState('NESTER')

  const setLoading = (loading: boolean) => {
    setIsLoading(loading)
  }

  const showLoader = (text: string = 'NESTER') => {
    setLoaderText(text)
    setIsLoading(true)
  }

  const hideLoader = () => {
    setIsLoading(false)
  }

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, showLoader, hideLoader }}>
      {children}
      <PageLoader isLoading={isLoading} text={loaderText} />
    </LoadingContext.Provider>
  )
}

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

export default LoadingProvider