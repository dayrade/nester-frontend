import * as Sentry from '@sentry/nextjs'
import { startSpan } from '@sentry/nextjs'
import { toast } from 'react-hot-toast'

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  API = 'api',
  DATABASE = 'database',
  UI = 'ui',
  NETWORK = 'network',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  UNKNOWN = 'unknown'
}

// Error context interface
export interface ErrorContext {
  userId?: string
  userEmail?: string
  page?: string
  component?: string
  action?: string
  metadata?: Record<string, any>
  [key: string]: any
}

// Error reporting class
export class ErrorReporter {
  private static instance: ErrorReporter
  private isInitialized = false

  private constructor() {}

  public static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter()
    }
    return ErrorReporter.instance
  }

  public initialize(userId?: string, userEmail?: string) {
    if (this.isInitialized) return

    // Set user context in Sentry
    Sentry.setUser({
      id: userId,
      email: userEmail,
    })

    // Set up global error handlers
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection)
      window.addEventListener('error', this.handleGlobalError)
    }

    this.isInitialized = true
  }

  public setUser(userId: string, userEmail?: string, userData?: Record<string, any>) {
    Sentry.setUser({
      id: userId,
      email: userEmail,
      ...userData,
    })
  }

  public clearUser() {
    Sentry.setUser(null)
  }

  public reportError(
    error: Error | string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    context?: ErrorContext,
    showToast = true
  ) {
    const errorMessage = typeof error === 'string' ? error : error.message
    const errorObj = typeof error === 'string' ? new Error(error) : error

    // Set context
    Sentry.withScope((scope) => {
      scope.setLevel(this.mapSeverityToSentryLevel(severity))
      scope.setTag('category', category)
      scope.setTag('severity', severity)
      
      if (context) {
        scope.setContext('error_context', context)
        if (context.page) scope.setTag('page', context.page)
        if (context.component) scope.setTag('component', context.component)
        if (context.action) scope.setTag('action', context.action)
      }

      // Capture the error
      Sentry.captureException(errorObj)
    })

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${severity.toUpperCase()}] [${category}]:`, errorMessage, context)
    }

    // Show user-friendly toast notification
    if (showToast && typeof window !== 'undefined') {
      this.showErrorToast(errorMessage, severity)
    }

    // Log to custom analytics if needed
    this.logToAnalytics(errorMessage, severity, category, context)
  }

  public reportInfo(
    message: string,
    category: string = 'info',
    context?: ErrorContext
  ) {
    Sentry.withScope((scope) => {
      scope.setLevel('info')
      scope.setTag('category', category)
      
      if (context) {
        scope.setContext('info_context', context)
      }

      Sentry.captureMessage(message)
    })

    if (process.env.NODE_ENV === 'development') {
      console.info(`[INFO] [${category}]:`, message, context)
    }
  }

  public reportWarning(
    message: string,
    category: string = 'warning',
    context?: ErrorContext
  ) {
    Sentry.withScope((scope) => {
      scope.setLevel('warning')
      scope.setTag('category', category)
      
      if (context) {
        scope.setContext('warning_context', context)
      }

      Sentry.captureMessage(message)
    })

    if (process.env.NODE_ENV === 'development') {
      console.warn(`[WARNING] [${category}]:`, message, context)
    }
  }

  public addBreadcrumb(
    message: string,
    category: string = 'default',
    level: 'debug' | 'info' | 'warning' | 'error' | 'fatal' = 'info',
    data?: Record<string, any>
  ) {
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data,
      timestamp: Date.now() / 1000,
    })
  }

  public startSpan(name: string, operation: string = 'navigation') {
    return startSpan({ name, op: operation }, (span) => span)
  }

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    this.reportError(
      new Error(`Unhandled Promise Rejection: ${event.reason}`),
      ErrorSeverity.HIGH,
      ErrorCategory.UNKNOWN,
      { action: 'unhandled_rejection' }
    )
  }

  private handleGlobalError = (event: ErrorEvent) => {
    this.reportError(
      new Error(`Global Error: ${event.message}`),
      ErrorSeverity.HIGH,
      ErrorCategory.UNKNOWN,
      { 
        action: 'global_error',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      }
    )
  }

  private mapSeverityToSentryLevel(severity: ErrorSeverity): Sentry.SeverityLevel {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'info'
      case ErrorSeverity.MEDIUM:
        return 'warning'
      case ErrorSeverity.HIGH:
        return 'error'
      case ErrorSeverity.CRITICAL:
        return 'fatal'
      default:
        return 'error'
    }
  }

  private showErrorToast(message: string, severity: ErrorSeverity) {
    const userMessage = this.getUserFriendlyMessage(message, severity)
    
    switch (severity) {
      case ErrorSeverity.LOW:
        toast(userMessage, { icon: 'ℹ️' })
        break
      case ErrorSeverity.MEDIUM:
        toast(userMessage, { icon: '⚠️' })
        break
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        toast.error(userMessage)
        break
    }
  }

  private getUserFriendlyMessage(message: string, severity: ErrorSeverity): string {
    // Map technical errors to user-friendly messages
    const errorMappings: Record<string, string> = {
      'Network Error': 'Connection problem. Please check your internet connection.',
      'Unauthorized': 'Please log in to continue.',
      'Forbidden': 'You don\'t have permission to perform this action.',
      'Not Found': 'The requested resource was not found.',
      'Internal Server Error': 'Something went wrong on our end. Please try again.',
      'Bad Request': 'Invalid request. Please check your input.',
      'Timeout': 'Request timed out. Please try again.',
    }

    // Check for mapped messages
    for (const [key, value] of Object.entries(errorMappings)) {
      if (message.includes(key)) {
        return value
      }
    }

    // Default messages based on severity
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'Something minor went wrong, but you can continue.'
      case ErrorSeverity.MEDIUM:
        return 'We encountered an issue. Please try again.'
      case ErrorSeverity.HIGH:
        return 'An error occurred. Please try again or contact support.'
      case ErrorSeverity.CRITICAL:
        return 'A critical error occurred. Please contact support immediately.'
      default:
        return 'An unexpected error occurred.'
    }
  }

  private logToAnalytics(
    message: string,
    severity: ErrorSeverity,
    category: ErrorCategory,
    context?: ErrorContext
  ) {
    // Log to Google Analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: message,
        fatal: severity === ErrorSeverity.CRITICAL,
        custom_map: {
          severity,
          category,
          ...context
        }
      })
    }
  }
}

// Export singleton instance
export const errorReporter = ErrorReporter.getInstance()

// Convenience functions
export const reportError = (
  error: Error | string,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  category: ErrorCategory = ErrorCategory.UNKNOWN,
  context?: ErrorContext,
  showToast = true
) => errorReporter.reportError(error, severity, category, context, showToast)

export const reportInfo = (
  message: string,
  category: string = 'info',
  context?: ErrorContext
) => errorReporter.reportInfo(message, category, context)

export const reportWarning = (
  message: string,
  category: string = 'warning',
  context?: ErrorContext
) => errorReporter.reportWarning(message, category, context)

export const addBreadcrumb = (
  message: string,
  category: string = 'default',
  level: 'debug' | 'info' | 'warning' | 'error' | 'fatal' = 'info',
  data?: Record<string, any>
) => errorReporter.addBreadcrumb(message, category, level, data)

export const setUser = (
  userId: string,
  userEmail?: string,
  userData?: Record<string, any>
) => errorReporter.setUser(userId, userEmail, userData)

export const clearUser = () => errorReporter.clearUser()