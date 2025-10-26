// ============================================================================
// APPLICATION ERROR CLASSES
// ============================================================================

export interface ErrorDetails {
  [key: string]: any;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: ErrorDetails;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: ErrorDetails,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

// ============================================================================
// CLIENT ERRORS (4xx)
// ============================================================================

export class BadRequestError extends AppError {
  constructor(message = "Bad request", details?: ErrorDetails) {
    super(400, "BAD_REQUEST", message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details?: ErrorDetails) {
    super(401, "UNAUTHORIZED", message, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details?: ErrorDetails) {
    super(403, "FORBIDDEN", message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found", details?: ErrorDetails) {
    super(404, "NOT_FOUND", message, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict", details?: ErrorDetails) {
    super(409, "CONFLICT", message, details);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests", details?: ErrorDetails) {
    super(429, "TOO_MANY_REQUESTS", message, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation error", details?: ErrorDetails) {
    super(422, "VALIDATION_ERROR", message, details);
  }
}

// ============================================================================
// SERVER ERRORS (5xx)
// ============================================================================

export class InternalServerError extends AppError {
  constructor(message = "Internal server error", details?: ErrorDetails) {
    super(500, "INTERNAL_SERVER_ERROR", message, details);
  }
}

export class ConfigError extends AppError {
  constructor(message = "Configuration error", details?: ErrorDetails) {
    super(500, "CONFIG_ERROR", message, details);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = "Service unavailable", details?: ErrorDetails) {
    super(503, "SERVICE_UNAVAILABLE", message, details);
  }
}

// ============================================================================
// AUTHENTICATION & AUTHORIZATION ERRORS
// ============================================================================

export class InvalidTokenError extends AppError {
  constructor(message = "Invalid or expired token", details?: ErrorDetails) {
    super(401, "INVALID_TOKEN", message, details);
  }
}

export class TokenExpiredError extends AppError {
  constructor(message = "Token has expired", details?: ErrorDetails) {
    super(401, "TOKEN_EXPIRED", message, details);
  }
}

export class InsufficientPermissionsError extends AppError {
  constructor(message = "Insufficient permissions", details?: ErrorDetails) {
    super(403, "INSUFFICIENT_PERMISSIONS", message, details);
  }
}

// ============================================================================
// BUSINESS LOGIC ERRORS
// ============================================================================

export class ResourceNotFoundError extends AppError {
  constructor(message = "Resource not found", details?: ErrorDetails) {
    super(404, "RESOURCE_NOT_FOUND", message, details);
  }
}

export class DuplicateResourceError extends AppError {
  constructor(message = "Resource already exists", details?: ErrorDetails) {
    super(409, "DUPLICATE_RESOURCE", message, details);
  }
}

export class InvalidOperationError extends AppError {
  constructor(message = "Invalid operation", details?: ErrorDetails) {
    super(400, "INVALID_OPERATION", message, details);
  }
}

// ============================================================================
// DATABASE ERRORS
// ============================================================================

export class DatabaseError extends AppError {
  constructor(message = "Database operation failed", details?: ErrorDetails) {
    super(500, "DATABASE_ERROR", message, details);
  }
}

export class UniqueConstraintError extends AppError {
  constructor(message = "Resource already exists", details?: ErrorDetails) {
    super(409, "UNIQUE_CONSTRAINT_VIOLATION", message, details);
  }
}

export class RecordNotFoundError extends AppError {
  constructor(message = "Record not found", details?: ErrorDetails) {
    super(404, "RECORD_NOT_FOUND", message, details);
  }
}

// ============================================================================
// EXTERNAL SERVICE ERRORS
// ============================================================================

export class ExternalServiceError extends AppError {
  constructor(
    service: string,
    message = "External service error",
    details?: ErrorDetails
  ) {
    super(503, "EXTERNAL_SERVICE_ERROR", message, {
      service,
      ...details,
    });
  }
}

export class CustomerIOError extends ExternalServiceError {
  constructor(message = "CustomerIO service error", details?: ErrorDetails) {
    super("CustomerIO", message, details);
  }
}

export class TwilioError extends ExternalServiceError {
  constructor(message = "Twilio service error", details?: ErrorDetails) {
    super("Twilio", message, details);
  }
}

// ============================================================================
// CONFIGURATION ERRORS
// ============================================================================

export class MissingConfigError extends ConfigError {
  constructor(configKey: string, details?: ErrorDetails) {
    super(`Missing required configuration: ${configKey}`, {
      configKey,
      ...details,
    });
  }
}

export class InvalidConfigError extends ConfigError {
  constructor(configKey: string, message: string, details?: ErrorDetails) {
    super(`Invalid configuration for ${configKey}: ${message}`, {
      configKey,
      ...details,
    });
  }
}

// ============================================================================
// VALIDATION ERRORS
// ============================================================================

export class RequiredFieldError extends ValidationError {
  constructor(field: string, details?: ErrorDetails) {
    super(`${field} is required`, { field, ...details });
  }
}

export class InvalidFormatError extends ValidationError {
  constructor(field: string, format: string, details?: ErrorDetails) {
    super(`${field} must be in ${format} format`, {
      field,
      format,
      ...details,
    });
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const isAppError = (error: any): error is AppError => {
  return error instanceof AppError;
};

export const createError = (
  statusCode: number,
  code: string,
  message: string,
  details?: ErrorDetails
): AppError => {
  return new AppError(statusCode, code, message, details);
};

// ============================================================================
// ERROR FACTORY FUNCTIONS
// ============================================================================

export const createValidationError = (issues: any[]): ValidationError => {
  return new ValidationError("Validation failed", { issues });
};

export const createPrismaError = (error: any): AppError => {
  switch (error.code) {
    case "P2002":
      return new UniqueConstraintError("Resource already exists", {
        reason: "Unique constraint violation",
        prismaCode: error.code,
      });
    case "P2025":
      return new RecordNotFoundError("Resource not found", {
        reason: "Record not found",
        prismaCode: error.code,
      });
    default:
      return new DatabaseError("Database operation failed", {
        prismaCode: error.code,
        message: error.message,
      });
  }
};

export const createJWTError = (error: any): AppError => {
  if (error.name === "JsonWebTokenError") {
    return new InvalidTokenError("Invalid authentication token", {
      reason: "Invalid token",
    });
  }
  if (error.name === "TokenExpiredError") {
    return new TokenExpiredError("Authentication token expired", {
      reason: "Token expired",
    });
  }
  return new UnauthorizedError("Authentication failed", {
    reason: error.message,
  });
};
