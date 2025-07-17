import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { errorReporter, ErrorSeverity, ErrorCategory } from './error-reporting'

// Standard API error types
export class APIError extends Error {
  public statusCode: number
  public code: string
  public details?: any

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message)
    this.name = 'APIError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

// Validation error
export class ValidationError extends APIError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

// Authentication error
export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

// Authorization error
export class AuthorizationError extends APIError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

// Not found error
export class NotFoundError extends APIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

// Rate limit error
export class RateLimitError extends APIError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED')
    this.name = 'RateLimitError'
  }
}

// Database error
export class DatabaseError extends APIError {
  constructor(message: string, details?: any) {
    super(message, 500, 'DATABASE_ERROR', details)
    this.name = 'DatabaseError'
  }
}

// External service error
export class ExternalServiceError extends APIError {
  constructor(message: string, service: string, details?: any) {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR', { service, ...details })
    this.name = 'ExternalServiceError'
  }
}

// Error response interface
interface ErrorResponse {
  error: {
    message: string
    code: string
    statusCode: number
    details?: any
    timestamp: string
    requestId?: string
  }
}

// API error handler function
export function handleAPIError(
  error: unknown,
  request: NextRequest,
  context?: Record<string, any>
): NextResponse<ErrorResponse> {
  const requestId = generateRequestId()
  const timestamp = new Date().toISOString()
  
  let apiError: APIError
  
  // Convert unknown error to APIError
  if (error instanceof APIError) {
    apiError = error
  } else if (error instanceof Error) {
    // Map common errors
    if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      apiError = new ExternalServiceError('External service unavailable', 'unknown')
    } else if (error.message.includes('timeout')) {
      apiError = new APIError('Request timeout', 408, 'TIMEOUT')
    } else if (error.message.includes('Unauthorized')) {
      apiError = new AuthenticationError()
    } else if (error.message.includes('Forbidden')) {
      apiError = new AuthorizationError()
    } else {
      apiError = new APIError(error.message, 500, 'INTERNAL_ERROR')
    }
  } else {
    apiError = new APIError('An unexpected error occurred', 500, 'UNKNOWN_ERROR')
  }

  // Determine error severity
  const severity = getSeverityFromStatusCode(apiError.statusCode)
  const category = getCategoryFromError(apiError)

  // Report error to monitoring
  errorReporter.reportError(
    apiError,
    severity,
    category,
    {
      component: 'API',
      action: 'api_request',
      page: request.nextUrl.pathname,
      metadata: {
        requestId,
        method: request.method,
        url: request.url,
        userAgent: request.headers.get('user-agent'),
        statusCode: apiError.statusCode,
        ...context
      }
    },
    false // Don't show toast for API errors
  )

  // Log error details
  console.error(`[API Error] ${requestId}:`, {
    error: apiError.message,
    code: apiError.code,
    statusCode: apiError.statusCode,
    method: request.method,
    url: request.url,
    stack: apiError.stack,
    details: apiError.details
  })

  // Create error response
  const errorResponse: ErrorResponse = {
    error: {
      message: getPublicErrorMessage(apiError),
      code: apiError.code,
      statusCode: apiError.statusCode,
      timestamp,
      requestId,
      ...(process.env.NODE_ENV === 'development' && {
        details: apiError.details
      })
    }
  }

  return NextResponse.json(errorResponse, {
    status: apiError.statusCode,
    headers: {
      'X-Request-ID': requestId,
      'Content-Type': 'application/json'
    }
  })
}

// Async wrapper for API routes
export function withErrorHandler(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context)
    } catch (error) {
      return handleAPIError(error, request, context)
    }
  }
}

// Helper functions
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function getSeverityFromStatusCode(statusCode: number): ErrorSeverity {
  if (statusCode >= 500) return ErrorSeverity.HIGH
  if (statusCode >= 400) return ErrorSeverity.MEDIUM
  return ErrorSeverity.LOW
}

function getCategoryFromError(error: APIError): ErrorCategory {
  if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
    return ErrorCategory.AUTHENTICATION
  }
  if (error instanceof ValidationError) {
    return ErrorCategory.VALIDATION
  }
  if (error instanceof DatabaseError) {
    return ErrorCategory.DATABASE
  }
  if (error instanceof ExternalServiceError) {
    return ErrorCategory.NETWORK
  }
  if (error instanceof RateLimitError) {
    return ErrorCategory.API
  }
  return ErrorCategory.API
}

function getPublicErrorMessage(error: APIError): string {
  // Don't expose internal error details in production
  if (process.env.NODE_ENV === 'production') {
    const publicMessages: Record<string, string> = {
      'VALIDATION_ERROR': 'Invalid input provided',
      'AUTHENTICATION_ERROR': 'Authentication required',
      'AUTHORIZATION_ERROR': 'Insufficient permissions',
      'NOT_FOUND': 'Resource not found',
      'RATE_LIMIT_EXCEEDED': 'Too many requests, please try again later',
      'DATABASE_ERROR': 'Database operation failed',
      'EXTERNAL_SERVICE_ERROR': 'External service unavailable',
      'TIMEOUT': 'Request timeout',
      'INTERNAL_ERROR': 'Internal server error',
      'UNKNOWN_ERROR': 'An unexpected error occurred'
    }
    
    return publicMessages[error.code] || 'An error occurred'
  }
  
  return error.message
}

// Validation helper
export function validateRequired(data: any, fields: string[]): void {
  const missing = fields.filter(field => !data[field])
  if (missing.length > 0) {
    throw new ValidationError(`Missing required fields: ${missing.join(', ')}`, { missing })
  }
}

// Rate limiting helper
export function checkRateLimit(identifier: string, limit: number, window: number): boolean {
  // This is a simple in-memory rate limiter
  // In production, you'd want to use Redis or similar
  const key = `rate_limit_${identifier}`
  const now = Date.now()
  
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(key)
    if (stored) {
      const { count, timestamp } = JSON.parse(stored)
      if (now - timestamp < window) {
        if (count >= limit) {
          throw new RateLimitError()
        }
        localStorage.setItem(key, JSON.stringify({ count: count + 1, timestamp }))
      } else {
        localStorage.setItem(key, JSON.stringify({ count: 1, timestamp: now }))
      }
    } else {
      localStorage.setItem(key, JSON.stringify({ count: 1, timestamp: now }))
    }
  }
  
  return true
}