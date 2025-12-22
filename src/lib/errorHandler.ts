import { toast } from 'sonner';

// Error categories for consistent handling
export type ErrorCategory = 
  | 'network' 
  | 'auth' 
  | 'validation' 
  | 'not_found' 
  | 'permission' 
  | 'server' 
  | 'unknown';

interface HandledError {
  message: string;
  category: ErrorCategory;
  originalError?: unknown;
  code?: string;
}

/**
 * Categorize an error based on its type and content
 */
export function categorizeError(error: unknown): HandledError {
  // Handle null/undefined
  if (!error) {
    return {
      message: 'An unexpected error occurred',
      category: 'unknown',
      originalError: error,
    };
  }

  // Handle Error instances
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Network errors
    if (
      error.name === 'NetworkError' ||
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection')
    ) {
      return {
        message: 'Network error. Please check your connection.',
        category: 'network',
        originalError: error,
      };
    }
    
    // Auth errors
    if (
      message.includes('authenticated') ||
      message.includes('unauthorized') ||
      message.includes('auth') ||
      message.includes('login') ||
      message.includes('sign in')
    ) {
      return {
        message: 'Authentication required. Please sign in.',
        category: 'auth',
        originalError: error,
      };
    }
    
    // Permission errors
    if (
      message.includes('permission') ||
      message.includes('forbidden') ||
      message.includes('access denied')
    ) {
      return {
        message: 'You don\'t have permission to perform this action.',
        category: 'permission',
        originalError: error,
      };
    }
    
    // Not found errors
    if (message.includes('not found') || message.includes('404')) {
      return {
        message: 'The requested resource was not found.',
        category: 'not_found',
        originalError: error,
      };
    }
    
    // Validation errors
    if (
      message.includes('invalid') ||
      message.includes('required') ||
      message.includes('validation')
    ) {
      return {
        message: error.message,
        category: 'validation',
        originalError: error,
      };
    }

    // Default Error handling
    return {
      message: error.message,
      category: 'unknown',
      originalError: error,
    };
  }

  // Handle Supabase errors (have code and message properties)
  if (typeof error === 'object' && 'code' in error && 'message' in error) {
    const supabaseError = error as { code: string; message: string };
    
    // Map common Supabase error codes
    const codeMap: Record<string, { message: string; category: ErrorCategory }> = {
      '23505': { message: 'This item already exists.', category: 'validation' },
      '23503': { message: 'Referenced item not found.', category: 'validation' },
      '42501': { message: 'Permission denied.', category: 'permission' },
      'PGRST116': { message: 'Not found.', category: 'not_found' },
    };
    
    const mapped = codeMap[supabaseError.code];
    if (mapped) {
      return {
        ...mapped,
        originalError: error,
        code: supabaseError.code,
      };
    }
    
    return {
      message: supabaseError.message,
      category: 'server',
      originalError: error,
      code: supabaseError.code,
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error,
      category: 'unknown',
      originalError: error,
    };
  }

  // Fallback
  return {
    message: 'An unexpected error occurred',
    category: 'unknown',
    originalError: error,
  };
}

/**
 * Get a user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  return categorizeError(error).message;
}

/**
 * Handle an error with a toast notification
 */
export function handleError(
  error: unknown, 
  options?: { 
    prefix?: string;
    showToast?: boolean;
  }
): HandledError {
  const { prefix, showToast = true } = options || {};
  const handled = categorizeError(error);
  
  if (showToast) {
    const message = prefix ? `${prefix}: ${handled.message}` : handled.message;
    toast.error(message);
  }
  
  return handled;
}

/**
 * Create a standardized error response for async operations
 */
export function createErrorHandler(prefix: string) {
  return (error: unknown) => {
    handleError(error, { prefix });
    throw error;
  };
}
