import type { ApiResponse } from "magnoli-types";

/**
 * Creates a success API response object.
 *
 * @param data - The response data payload
 * @param message - Optional success message (defaults to 'Success')
 * @returns ApiResponse object with status 'success'
 *
 * @example
 * ```typescript
 * // Basic usage
 * res.json(success({ user }));
 * // { status: 'success', message: 'Success', data: { user } }
 *
 * // With custom message
 * res.status(201).json(success({ user }, 'User created'));
 * // { status: 'success', message: 'User created', data: { user } }
 * ```
 */
export function success<T>(data: T, message = "Success"): ApiResponse<T> {
  return {
    status: "success",
    message,
    data,
  };
}
