import type { ApiResponse } from "magnoli-types";

/**
 * Creates an error API response object.
 *
 * @param message - The error message
 * @param errors - Optional error codes or details array
 * @param data - Optional data payload (defaults to null)
 * @returns ApiResponse object with status 'error'
 *
 * @example
 * ```typescript
 * // Basic usage
 * res.status(404).json(error('User not found'));
 * // { status: 'error', message: 'User not found', data: null }
 *
 * // With error codes
 * res.status(400).json(error('Validation failed', ['INVALID_EMAIL', 'MISSING_NAME']));
 * // { status: 'error', message: 'Validation failed', errors: ['INVALID_EMAIL', 'MISSING_NAME'], data: null }
 *
 * // With data payload
 * res.status(422).json(error('Validation failed', validationErrors, { field: 'email' }));
 * ```
 */
export function error<TData = null>(
  message: string,
  errors?: unknown,
  data?: TData
): ApiResponse<TData> {
  let errorArray: string[] | undefined;

  if (errors) {
    if (Array.isArray(errors)) {
      errorArray = errors.map((e) =>
        typeof e === "string" ? e : JSON.stringify(e)
      );
    } else if (typeof errors === "string") {
      errorArray = [errors];
    } else {
      errorArray = [JSON.stringify(errors)];
    }
  }

  return {
    status: "error",
    message,
    errors: errorArray,
    data: (data ?? null) as TData,
  };
}
