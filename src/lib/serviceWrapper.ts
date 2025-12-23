import { supabase } from '@/integrations/supabase/client';
import { categorizeError, type ErrorCategory } from './errorHandler';
import { logger } from './logger';

// ============================================================================
// Types
// ============================================================================

export interface ServiceOptions {
  /** Number of retry attempts for failed requests (default: 0) */
  retries?: number;
  /** Delay between retries in ms (default: 1000) */
  retryDelay?: number;
  /** Whether to use exponential backoff (default: true) */
  exponentialBackoff?: boolean;
  /** Timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Categories of errors that should trigger retry */
  retryOn?: ErrorCategory[];
}

export interface InvokeOptions extends ServiceOptions {
  /** Request body */
  body?: Record<string, unknown>;
  /** Additional headers */
  headers?: Record<string, string>;
  /** HTTP method (default: POST) */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

export interface ServiceResult<T> {
  data: T | null;
  error: Error | null;
  category?: ErrorCategory;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Sleep for a given duration
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate retry delay with optional exponential backoff
 */
function getRetryDelay(attempt: number, baseDelay: number, exponential: boolean): number {
  if (!exponential) return baseDelay;
  return baseDelay * Math.pow(2, attempt);
}

/**
 * Check if an error category should trigger a retry
 */
function shouldRetry(category: ErrorCategory, retryOn: ErrorCategory[]): boolean {
  return retryOn.includes(category);
}

/**
 * Get auth token from current session
 */
async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: ServiceOptions = {}
): Promise<T> {
  const {
    retries = 0,
    retryDelay = 1000,
    exponentialBackoff = true,
    retryOn = ['network', 'server'],
  } = options;

  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt <= retries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const { category } = categorizeError(error);

      logger.warn(`[ServiceWrapper] Attempt ${attempt + 1} failed:`, {
        error: lastError.message,
        category,
      });

      // Only retry if we have attempts left and the error is retryable
      if (attempt < retries && shouldRetry(category, retryOn)) {
        const delay = getRetryDelay(attempt, retryDelay, exponentialBackoff);
        logger.info(`[ServiceWrapper] Retrying in ${delay}ms...`);
        await sleep(delay);
        attempt++;
      } else {
        break;
      }
    }
  }

  throw lastError;
}

/**
 * Invoke a Supabase Edge Function with unified error handling
 */
export async function invokeEdgeFunction<T = unknown>(
  functionName: string,
  options: InvokeOptions = {}
): Promise<ServiceResult<T>> {
  const {
    body,
    headers = {},
    retries = 0,
    retryDelay = 1000,
    exponentialBackoff = true,
    retryOn = ['network', 'server'],
  } = options;

  const execute = async (): Promise<T> => {
    logger.info(`[ServiceWrapper] Invoking edge function: ${functionName}`);

    const { data, error } = await supabase.functions.invoke<T>(functionName, {
      body,
      headers,
    });

    if (error) {
      logger.error(`[ServiceWrapper] Edge function error:`, {
        function: functionName,
        error: error.message,
      });
      throw new Error(error.message || `Failed to invoke ${functionName}`);
    }

    // Check for error in response data
    if (data && typeof data === 'object' && 'error' in data) {
      const errorData = data as { error: string };
      throw new Error(errorData.error);
    }

    return data as T;
  };

  try {
    const data = await withRetry(execute, {
      retries,
      retryDelay,
      exponentialBackoff,
      retryOn,
    });

    return { data, error: null };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    const { category } = categorizeError(error);
    
    return { data: null, error: err, category };
  }
}

/**
 * Make an authenticated fetch request
 */
export async function authenticatedFetch<T = unknown>(
  url: string,
  options: RequestInit & ServiceOptions = {}
): Promise<ServiceResult<T>> {
  const {
    retries = 0,
    retryDelay = 1000,
    exponentialBackoff = true,
    retryOn = ['network', 'server'],
    timeout = 30000,
    ...fetchOptions
  } = options;

  const execute = async (): Promise<T> => {
    const token = await getAuthToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  try {
    const data = await withRetry(execute, {
      retries,
      retryDelay,
      exponentialBackoff,
      retryOn,
    });

    return { data, error: null };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    const { category } = categorizeError(error);
    
    return { data: null, error: err, category };
  }
}

// ============================================================================
// Service Factory
// ============================================================================

export interface ServiceMethod<TInput, TOutput> {
  (input: TInput): Promise<TOutput>;
}

export interface ServiceDefinition<TInput, TOutput> {
  /** Edge function name to invoke */
  functionName?: string;
  /** Transform input before sending */
  transformInput?: (input: TInput) => Record<string, unknown>;
  /** Transform response data */
  transformOutput?: (data: unknown) => TOutput;
  /** Default options for this service method */
  options?: ServiceOptions;
  /** Custom execution function (overrides functionName) */
  execute?: (input: TInput) => Promise<TOutput>;
}

/**
 * Create a standardized service method
 */
export function createServiceMethod<TInput, TOutput>(
  definition: ServiceDefinition<TInput, TOutput>
): ServiceMethod<TInput, TOutput> {
  const {
    functionName,
    transformInput = (input) => input as unknown as Record<string, unknown>,
    transformOutput = (data) => data as TOutput,
    options = {},
    execute,
  } = definition;

  return async (input: TInput): Promise<TOutput> => {
    // Use custom execute function if provided
    if (execute) {
      return withRetry(() => execute(input), options);
    }

    // Otherwise use edge function invocation
    if (!functionName) {
      throw new Error('ServiceMethod requires either functionName or execute');
    }

    const body = transformInput(input);
    const { data, error } = await invokeEdgeFunction(functionName, {
      body,
      ...options,
    });

    if (error) {
      throw error;
    }

    return transformOutput(data);
  };
}

/**
 * Create a service object with multiple methods
 */
export function createService<T extends Record<string, ServiceDefinition<unknown, unknown>>>(
  definitions: T
): { [K in keyof T]: ServiceMethod<
  T[K] extends ServiceDefinition<infer I, unknown> ? I : never,
  T[K] extends ServiceDefinition<unknown, infer O> ? O : never
> } {
  const service = {} as Record<string, ServiceMethod<unknown, unknown>>;

  for (const [key, definition] of Object.entries(definitions)) {
    service[key] = createServiceMethod(definition);
  }

  return service as { [K in keyof T]: ServiceMethod<
    T[K] extends ServiceDefinition<infer I, unknown> ? I : never,
    T[K] extends ServiceDefinition<unknown, infer O> ? O : never
  > };
}

// ============================================================================
// Convenience Wrappers
// ============================================================================

/**
 * Invoke edge function that returns data directly (throws on error)
 */
export async function invoke<T = unknown>(
  functionName: string,
  body?: Record<string, unknown>,
  options?: ServiceOptions
): Promise<T> {
  const { data, error } = await invokeEdgeFunction<T>(functionName, {
    body,
    ...options,
  });

  if (error) {
    throw error;
  }

  return data as T;
}

/**
 * Invoke edge function with automatic retry for network errors
 */
export async function invokeWithRetry<T = unknown>(
  functionName: string,
  body?: Record<string, unknown>,
  retries: number = 3
): Promise<T> {
  return invoke<T>(functionName, body, { retries });
}
