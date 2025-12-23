/**
 * Production-safe logger utility
 * Only logs in development mode, silently ignores in production
 */

const isDevelopment = import.meta.env.DEV;

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface Logger {
  log: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  group: (label: string) => void;
  groupEnd: () => void;
  table: (data: unknown) => void;
  time: (label: string) => void;
  timeEnd: (label: string) => void;
}

const noop = () => {};

const createLogger = (level: LogLevel) => {
  if (!isDevelopment) return noop;
  return (...args: unknown[]) => {
    console[level](...args);
  };
};

export const logger: Logger = {
  log: createLogger('log'),
  info: createLogger('info'),
  warn: createLogger('warn'),
  error: createLogger('error'),
  debug: createLogger('debug'),
  group: isDevelopment ? (label: string) => console.group(label) : noop,
  groupEnd: isDevelopment ? () => console.groupEnd() : noop,
  table: isDevelopment ? (data: unknown) => console.table(data) : noop,
  time: isDevelopment ? (label: string) => console.time(label) : noop,
  timeEnd: isDevelopment ? (label: string) => console.timeEnd(label) : noop,
};

// For critical errors that should always be logged (e.g., to error tracking services)
export const logCriticalError = (error: Error, context?: Record<string, unknown>) => {
  // Always log critical errors, even in production
  console.error('[CRITICAL]', error.message, context);
  
  // In production, you might want to send this to an error tracking service
  // This is already handled by Sentry, but we keep console.error for visibility
};
