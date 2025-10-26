// ============================================================================
// HTTP RESPONSE HELPERS
// ============================================================================

import { Response } from "express";

export function success(res: Response, data: any): Response {
  return res.status(200).json({ success: true, data });
}

export function fail(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: any
): Response {
  return res
    .status(statusCode)
    .json({ success: false, error: { code, message, details } });
}

// Preset response helpers
export const failPresets = {
  badRequest: (res: Response, details?: any, message = "Bad request") =>
    fail(res, 400, "BAD_REQUEST", message, details),
  unauthorized: (res: Response, details?: any, message = "Unauthorized") =>
    fail(res, 401, "UNAUTHORIZED", message, details),
  forbidden: (res: Response, details?: any, message = "Forbidden") =>
    fail(res, 403, "FORBIDDEN", message, details),
  notFound: (res: Response, details?: any, message = "Not found") =>
    fail(res, 404, "NOT_FOUND", message, details),
  conflict: (res: Response, details?: any, message = "Conflict") =>
    fail(res, 409, "CONFLICT", message, details),
  tooManyRequests: (
    res: Response,
    details?: any,
    message = "Too many requests"
  ) => fail(res, 429, "TOO_MANY_REQUESTS", message, details),
  validationError: (
    res: Response,
    details?: any,
    message = "Validation error"
  ) => fail(res, 422, "VALIDATION_ERROR", message, details),
  configError: (
    res: Response,
    details?: any,
    message = "Configuration error"
  ) => fail(res, 500, "CONFIG_ERROR", message, details),
  internal: (res: Response, details?: any, message = "Internal server error") =>
    fail(res, 500, "INTERNAL_SERVER_ERROR", message, details),
  serviceUnavailable: (
    res: Response,
    details?: any,
    message = "Service unavailable"
  ) => fail(res, 503, "SERVICE_UNAVAILABLE", message, details),
};

export const successPresets = {
  created: (res: Response, data: any) => success(res, data),
};
