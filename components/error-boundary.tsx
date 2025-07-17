'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { errorReporter, ErrorSeverity, ErrorCategory } from '@/lib/error-reporting'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Generate a unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    this.setState({
      errorInfo,
      errorId
    })

    // Report error to our error reporting system
    errorReporter.reportError(
      error,
      ErrorSeverity.HIGH,
      ErrorCategory.UI,
      {
        component: 'ErrorBoundary',
        action: 'component_error',
        metadata: {
          errorId,
          componentStack: errorInfo.componentStack,
          errorBoundary: true
        }
      },
      false // Don't show toast as we have custom UI
    )

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    })
  }

  handleReportBug = () => {
    const { error, errorId } = this.state
    const subject = `Bug Report - Error ID: ${errorId}`
    const body = `
Error ID: ${errorId}
Error Message: ${error?.message}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
URL: ${window.location.href}

Please describe what you were doing when this error occurred:

`
    
    const mailtoLink = `mailto:support@nester.studio?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink)
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-center">
                We encountered an unexpected error. Our team has been notified and is working on a fix.
              </p>
              
              {this.state.errorId && (
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Error ID:</strong> {this.state.errorId}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Please include this ID when contacting support.
                  </p>
                </div>
              )}

              {this.props.showDetails && this.state.error && process.env.NODE_ENV === 'development' && (
                <details className="bg-red-50 p-3 rounded-lg">
                  <summary className="text-sm font-medium text-red-800 cursor-pointer">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 text-xs text-red-700">
                    <p><strong>Message:</strong> {this.state.error.message}</p>
                    <p><strong>Stack:</strong></p>
                    <pre className="whitespace-pre-wrap text-xs mt-1 bg-red-100 p-2 rounded overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={this.handleRetry}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
              </div>

              <Button 
                variant="ghost"
                size="sm"
                onClick={this.handleReportBug}
                className="w-full flex items-center justify-center gap-2 text-gray-600"
              >
                <Bug className="w-4 h-4" />
                Report Bug
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Hook for manual error reporting in functional components
export function useErrorHandler() {
  return React.useCallback((error: Error, context?: any) => {
    errorReporter.reportError(
      error,
      ErrorSeverity.MEDIUM,
      ErrorCategory.UI,
      {
        component: 'useErrorHandler',
        action: 'manual_error_report',
        metadata: context
      }
    )
  }, [])
}