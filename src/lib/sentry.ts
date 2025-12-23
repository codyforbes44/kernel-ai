import * as Sentry from '@sentry/react';

// Initialize Sentry - only in production or when DSN is configured
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.log('[Sentry] No DSN configured, skipping initialization');
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    
    // Performance monitoring
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    
    // Session replay - only in production
    replaysSessionSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 0,
    replaysOnErrorSampleRate: 1.0,
    
    // Integrations
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    
    // Filter out noisy errors
    ignoreErrors: [
      'ResizeObserver loop',
      'Non-Error promise rejection',
      'Network request failed',
      'Load failed',
      'Failed to fetch',
      'ChunkLoadError',
    ],
    
    // Sanitize sensitive data
    beforeSend(event) {
      // Remove sensitive data from URLs
      if (event.request?.url) {
        event.request.url = event.request.url.replace(/token=[^&]+/g, 'token=REDACTED');
      }
      
      // Remove auth headers
      if (event.request?.headers) {
        delete event.request.headers['Authorization'];
        delete event.request.headers['authorization'];
      }
      
      return event;
    },
  });

  console.log('[Sentry] Initialized successfully');
}

// Capture exception with additional context
export function captureError(error: Error, context?: Record<string, unknown>) {
  console.error('[Error]', error);
  
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

// Set user context for error tracking
export function setUserContext(user: { id: string; email?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
  });
}

// Clear user context on logout
export function clearUserContext() {
  Sentry.setUser(null);
}

// Add breadcrumb for debugging
export function addBreadcrumb(
  message: string,
  category: string,
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, unknown>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
  });
}

// Performance transaction
export function startTransaction(name: string, op: string) {
  return Sentry.startInactiveSpan({
    name,
    op,
  });
}

export { Sentry };
