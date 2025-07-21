'use client'

import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { useSupabase } from './supabase-provider'
import { errorReporter, setUser, clearUser, addBreadcrumb, ErrorSeverity, ErrorCategory } from '../error-reporting'

interface ErrorReportingContextType {
  reportError: typeof errorReporter.reportError
  reportInfo: typeof errorReporter.reportInfo
  reportWarning: typeof errorReporter.reportWarning
  addBreadcrumb: typeof addBreadcrumb
}

const ErrorReportingContext = createContext<ErrorReportingContextType | undefined>(undefined)

interface ErrorReportingProviderProps {
  children: ReactNode
}

export function ErrorReportingProvider({ children }: ErrorReportingProviderProps) {
  const { user } = useSupabase()

  useEffect(() => {
    // Initialize error reporting
    errorReporter.initialize(user?.id, user?.email)

    // Set user context when user changes
    if (user) {
      setUser(user.id, user.email, {
        created_at: user.created_at,
      })
      
      // Add breadcrumb for user session
      addBreadcrumb(
        `User ${user.email} logged in`,
        'auth',
        'info',
        { userId: user.id }
      )
    } else {
      clearUser()
    }
  }, [user])

  useEffect(() => {
    // Add breadcrumb for page navigation
    const handleRouteChange = () => {
      addBreadcrumb(
        `Navigated to ${window.location.pathname}`,
        'navigation',
        'info',
        { 
          pathname: window.location.pathname,
          search: window.location.search,
          hash: window.location.hash
        }
      )
    }

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange)
    
    // Initial page load
    handleRouteChange()

    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [])

  const contextValue: ErrorReportingContextType = {
    reportError: errorReporter.reportError.bind(errorReporter),
    reportInfo: errorReporter.reportInfo.bind(errorReporter),
    reportWarning: errorReporter.reportWarning.bind(errorReporter),
    addBreadcrumb,
  }

  return (
    <ErrorReportingContext.Provider value={contextValue}>
      {children}
    </ErrorReportingContext.Provider>
  )
}

export function useErrorReporting() {
  const context = useContext(ErrorReportingContext)
  if (context === undefined) {
    throw new Error('useErrorReporting must be used within an ErrorReportingProvider')
  }
  return context
}

// Hook for tracking user actions
export function useActionTracking() {
  const { addBreadcrumb } = useErrorReporting()

  const trackAction = React.useCallback(
    (action: string, category: string = 'user_action', data?: Record<string, any>) => {
      addBreadcrumb(
        `User action: ${action}`,
        category,
        'info',
        {
          action,
          timestamp: new Date().toISOString(),
          ...data
        }
      )
    },
    [addBreadcrumb]
  )

  return { trackAction }
}

// Hook for API call tracking
export function useAPITracking() {
  const { addBreadcrumb, reportError } = useErrorReporting()

  const trackAPICall = React.useCallback(
    (endpoint: string, method: string, status?: number, duration?: number) => {
      addBreadcrumb(
        `API ${method} ${endpoint}`,
        'api',
        status && status >= 400 ? 'error' : 'info',
        {
          endpoint,
          method,
          status,
          duration,
          timestamp: new Date().toISOString()
        }
      )
    },
    [addBreadcrumb]
  )

  const trackAPIError = React.useCallback(
    (endpoint: string, method: string, error: Error, status?: number) => {
      reportError(
        error,
        status && status >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
        ErrorCategory.API,
        {
          component: 'API',
          action: 'api_call',
          metadata: {
            endpoint,
            method,
            status,
            timestamp: new Date().toISOString()
          }
        }
      )
    },
    [reportError]
  )

  return { trackAPICall, trackAPIError }
}