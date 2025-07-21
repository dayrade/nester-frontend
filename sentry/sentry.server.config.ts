import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',
  
  // Basic integrations will be automatically included
  
  // Performance monitoring
  beforeSend(event, hint) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry Server Event:', event)
    }
    
    // Don't send events for certain errors
    if (event.exception) {
      const error = hint.originalException
      if (error && typeof error === 'object' && 'message' in error) {
        const message = error.message as string
        // Filter out common non-critical server errors
        if (
          message.includes('ECONNRESET') ||
          message.includes('ENOTFOUND') ||
          message.includes('timeout')
        ) {
          return null
        }
      }
    }
    
    return event
  },
  
  // Set server context
  initialScope: {
    tags: {
      component: 'server',
    },
  },
})