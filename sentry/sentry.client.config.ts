import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',
  
  // Capture unhandled promise rejections
  captureUnhandledRejections: true,
  
  // Capture console errors
  integrations: [
    new Sentry.BrowserTracing({
      // Set sampling rate for performance monitoring
      tracePropagationTargets: [
        'localhost',
        /^https:\/\/yourserver\//,
        /^\//,
      ],
    }),
    new Sentry.Replay({
      // Capture 10% of all sessions,
      // plus 100% of sessions with an error
      sessionSampleRate: 0.1,
      errorSampleRate: 1.0,
    }),
  ],
  
  // Performance monitoring
  beforeSend(event, hint) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry Event:', event)
    }
    
    // Don't send events for certain errors
    if (event.exception) {
      const error = hint.originalException
      if (error && typeof error === 'object' && 'message' in error) {
        const message = error.message as string
        // Filter out common non-critical errors
        if (
          message.includes('Non-Error promise rejection captured') ||
          message.includes('ResizeObserver loop limit exceeded') ||
          message.includes('Script error')
        ) {
          return null
        }
      }
    }
    
    return event
  },
  
  // Set user context
  initialScope: {
    tags: {
      component: 'client',
    },
  },
})