import createHttpError, { isHttpError } from 'http-errors';

// Re-export isHttpError for use in consuming apps
export { isHttpError };

/**
 * Extended HTTP error with optional details property.
 */
export interface HttpErrorWithDetails extends createHttpError.HttpError {
  details?: unknown;
}

/**
 * Creates an HTTP error using http-errors package.
 *
 * Can be used in two ways:
 * 1. `createError(status, message?, details?)` - Create error with status code
 * 2. `createError.NotFound(message?, details?)` - Create error using named method
 *
 * @example
 * ```typescript
 * // Using status code
 * throw createError(404, 'User not found');
 * throw createError(400, 'Invalid input', { field: 'email' });
 *
 * // Using named methods
 * throw createError.NotFound('User not found');
 * throw createError.BadRequest('Invalid email');
 * throw createError.Unauthorized();
 * ```
 */
function createErrorWithDetails(
  status: number,
  message?: string,
  details?: unknown,
): HttpErrorWithDetails {
  const error = (
    message ? createHttpError(status, message) : createHttpError(status)
  ) as HttpErrorWithDetails;
  if (details !== undefined) {
    error.details = details;
  }
  return error;
}

/**
 * Error factory with named methods for common HTTP errors.
 */
export const createError = Object.assign(createErrorWithDetails, {
  /**
   * 400 Bad Request - The request was malformed or invalid.
   */
  BadRequest: (message?: string, details?: unknown): HttpErrorWithDetails =>
    createErrorWithDetails(400, message || 'Bad Request', details),

  /**
   * 401 Unauthorized - Authentication is required or has failed.
   */
  Unauthorized: (message?: string, details?: unknown): HttpErrorWithDetails =>
    createErrorWithDetails(401, message || 'Unauthorized', details),

  /**
   * 403 Forbidden - The request is valid but the user lacks permission.
   */
  Forbidden: (message?: string, details?: unknown): HttpErrorWithDetails =>
    createErrorWithDetails(403, message || 'Forbidden', details),

  /**
   * 404 Not Found - The requested resource does not exist.
   */
  NotFound: (message?: string, details?: unknown): HttpErrorWithDetails =>
    createErrorWithDetails(404, message || 'Not Found', details),

  /**
   * 409 Conflict - The request conflicts with the current state.
   */
  Conflict: (message?: string, details?: unknown): HttpErrorWithDetails =>
    createErrorWithDetails(409, message || 'Conflict', details),

  /**
   * 422 Unprocessable Entity - Validation error.
   */
  UnprocessableEntity: (message?: string, details?: unknown): HttpErrorWithDetails =>
    createErrorWithDetails(422, message || 'Validation Error', details),

  /**
   * 500 Internal Server Error - An unexpected error occurred.
   */
  InternalServerError: (message?: string, details?: unknown): HttpErrorWithDetails =>
    createErrorWithDetails(500, message || 'Internal Server Error', details),

  /**
   * 503 Service Unavailable - The service is temporarily unavailable.
   */
  ServiceUnavailable: (message?: string, details?: unknown): HttpErrorWithDetails =>
    createErrorWithDetails(503, message || 'Service Unavailable', details),
});

export type CreateError = typeof createError;
