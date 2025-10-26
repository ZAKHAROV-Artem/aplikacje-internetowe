// ============================================================================
// HTTP ERROR PRESETS
// ============================================================================

// Client Error Presets (4xx)
export const clientErrors = {
  badRequest: { statusCode: 400, code: "BAD_REQUEST", message: "Bad request" },
  unauthorized: {
    statusCode: 401,
    code: "UNAUTHORIZED",
    message: "Unauthorized",
  },
  forbidden: { statusCode: 403, code: "FORBIDDEN", message: "Forbidden" },
  notFound: { statusCode: 404, code: "NOT_FOUND", message: "Not found" },
  conflict: { statusCode: 409, code: "CONFLICT", message: "Conflict" },
  tooManyRequests: {
    statusCode: 429,
    code: "TOO_MANY_REQUESTS",
    message: "Too many requests",
  },
  validationError: {
    statusCode: 422,
    code: "VALIDATION_ERROR",
    message: "Validation error",
  },
} as const;

// Server Error Presets (5xx)
export const serverErrors = {
  configError: {
    statusCode: 500,
    code: "CONFIG_ERROR",
    message: "Configuration error",
  },
  internal: {
    statusCode: 500,
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
  },
  serviceUnavailable: {
    statusCode: 503,
    code: "SERVICE_UNAVAILABLE",
    message: "Service unavailable",
  },
} as const;

// Authentication & Authorization Presets
export const authErrors = {
  invalidToken: {
    statusCode: 401,
    code: "INVALID_TOKEN",
    message: "Invalid or expired token",
  },
  tokenExpired: {
    statusCode: 401,
    code: "TOKEN_EXPIRED",
    message: "Token has expired",
  },
  insufficientPermissions: {
    statusCode: 403,
    code: "INSUFFICIENT_PERMISSIONS",
    message: "Insufficient permissions",
  },
} as const;

// Business Logic Presets
export const businessErrors = {
  resourceNotFound: {
    statusCode: 404,
    code: "RESOURCE_NOT_FOUND",
    message: "Resource not found",
  },
  duplicateResource: {
    statusCode: 409,
    code: "DUPLICATE_RESOURCE",
    message: "Resource already exists",
  },
  invalidOperation: {
    statusCode: 400,
    code: "INVALID_OPERATION",
    message: "Invalid operation",
  },
} as const;

// Combined presets for backward compatibility
export const presets = {
  ...clientErrors,
  ...serverErrors,
  ...authErrors,
  ...businessErrors,
} as const;
