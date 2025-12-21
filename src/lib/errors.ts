/**
 * Custom error types for consistent error handling across the application
 */

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NetworkError extends AppError {
  public readonly originalError?: Error;

  constructor(message = 'Network request failed', originalError?: Error) {
    super(message, 'NETWORK_ERROR', 503);
    this.name = 'NetworkError';
    this.originalError = originalError;
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class AuthError extends AppError {
  constructor(message = 'Authentication required', code = 'AUTH_ERROR') {
    super(message, code, 401);
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Storage-specific errors for file operations
 */
export class StorageError extends AppError {
  constructor(
    message: string,
    public readonly operation: 'upload' | 'download' | 'delete' | 'list' | 'move' | 'create',
    public readonly bucket?: string,
    public readonly path?: string
  ) {
    super(message, 'STORAGE_ERROR', 500);
    this.name = 'StorageError';
    Object.setPrototypeOf(this, StorageError.prototype);
  }

  static fromError(
    error: unknown,
    operation: 'upload' | 'download' | 'delete' | 'list' | 'move' | 'create',
    bucket?: string,
    path?: string
  ): StorageError {
    const message = error instanceof Error ? error.message : 'Storage operation failed';
    return new StorageError(message, operation, bucket, path);
  }
}

/**
 * Project-specific errors
 */
export class ProjectError extends AppError {
  constructor(
    message: string,
    public readonly operation: 'create' | 'update' | 'delete' | 'remix' | 'load',
    public readonly projectId?: string
  ) {
    super(message, 'PROJECT_ERROR', 500);
    this.name = 'ProjectError';
    Object.setPrototypeOf(this, ProjectError.prototype);
  }

  static fromError(
    error: unknown,
    operation: 'create' | 'update' | 'delete' | 'remix' | 'load',
    projectId?: string
  ): ProjectError {
    const message = error instanceof Error ? error.message : 'Project operation failed';
    return new ProjectError(message, operation, projectId);
  }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if an error is a StorageError
 */
export function isStorageError(error: unknown): error is StorageError {
  return error instanceof StorageError;
}

/**
 * Type guard to check if an error is a ProjectError
 */
export function isProjectError(error: unknown): error is ProjectError {
  return error instanceof ProjectError;
}

/**
 * Extract a user-friendly message from any error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}
