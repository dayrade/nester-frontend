import { NextRequest, NextResponse } from 'next/server'
import { 
  withErrorHandler, 
  APIError, 
  ValidationError, 
  AuthenticationError,
  DatabaseError,
  validateRequired 
} from '@/lib/api-error-handler'
import { errorReporter, ErrorSeverity, ErrorCategory } from '@/lib/error-reporting'

// Example API route with comprehensive error handling
async function handler(request: NextRequest) {
  const method = request.method
  
  // Add breadcrumb for API call tracking
  errorReporter.addBreadcrumb(
    `API call: ${method} /api/example-error-handling`,
    'api',
    'info',
    { method, url: request.url }
  )

  switch (method) {
    case 'GET':
      return handleGet(request)
    case 'POST':
      return handlePost(request)
    default:
      throw new APIError(`Method ${method} not allowed`, 405, 'METHOD_NOT_ALLOWED')
  }
}

async function handleGet(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const errorType = searchParams.get('error')
  
  // Demonstrate different types of errors for testing
  switch (errorType) {
    case 'validation':
      throw new ValidationError('Invalid parameters provided', {
        field: 'email',
        message: 'Email is required'
      })
    
    case 'auth':
      throw new AuthenticationError('User not authenticated')
    
    case 'database':
      throw new DatabaseError('Failed to connect to database', {
        code: 'CONNECTION_FAILED',
        host: 'localhost'
      })
    
    case 'generic':
      throw new APIError('Something went wrong', 500, 'GENERIC_ERROR')
    
    case 'unexpected':
      // Simulate an unexpected error
      throw new Error('Unexpected error occurred')
    
    default:
      // Success response
      return NextResponse.json({
        message: 'Error handling example API',
        timestamp: new Date().toISOString(),
        availableErrors: [
          'validation',
          'auth', 
          'database',
          'generic',
          'unexpected'
        ],
        usage: 'Add ?error=<type> to test different error types'
      })
  }
}

async function handlePost(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    validateRequired(body, ['name', 'email'])
    
    // Simulate processing
    if (body.email === 'error@example.com') {
      throw new ValidationError('This email is not allowed')
    }
    
    // Report successful operation
    errorReporter.reportInfo(
      'User data processed successfully',
      'api_success',
      {
        component: 'example-api',
        action: 'process_user_data',
        metadata: { email: body.email }
      }
    )
    
    return NextResponse.json({
      message: 'Data processed successfully',
      data: {
        name: body.name,
        email: body.email,
        processedAt: new Date().toISOString()
      }
    })
    
  } catch (error) {
    // If it's a JSON parsing error, convert to ValidationError
    if (error instanceof SyntaxError) {
      throw new ValidationError('Invalid JSON in request body')
    }
    
    // Re-throw other errors to be handled by the error handler
    throw error
  }
}

// Export the handler wrapped with error handling
export const GET = withErrorHandler(handler)
export const POST = withErrorHandler(handler)