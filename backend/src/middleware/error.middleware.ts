import { Request, Response, NextFunction } from "express";
import { error } from "../lib/responses";
import { isHttpError, type HttpErrorWithDetails } from "../lib/responses";

export interface ErrorWithCode extends Error {
  code?: string;
  status?: number;
  field?: string;
  service?: string;
}

interface FormattedError {
  statusCode: number;
  message: string;
  code: string;
  details?: unknown;
}

function createPrismaError(err: ErrorWithCode): FormattedError {
  const code = err.code || "PRISMA_ERROR";
  let statusCode = 500;
  let message = "Database operation failed";

  // Map common Prisma error codes to HTTP status codes
  switch (code) {
    case "P2002":
      statusCode = 409;
      message = "A record with this value already exists";
      break;
    case "P2025":
      statusCode = 404;
      message = "Record not found";
      break;
    case "P2003":
      statusCode = 400;
      message = "Foreign key constraint failed";
      break;
    case "P2014":
      statusCode = 400;
      message = "Invalid ID provided";
      break;
    default:
      message = err.message || "Database operation failed";
  }

  return {
    statusCode,
    message,
    code,
    details: { originalError: err.message },
  };
}

function createJWTError(err: Error): FormattedError {
  let statusCode = 401;
  let message = "Authentication failed";
  let code = "JWT_ERROR";

  if (err.name === "TokenExpiredError") {
    message = "Token has expired";
    code = "TOKEN_EXPIRED";
  } else if (err.name === "JsonWebTokenError") {
    message = "Invalid token";
    code = "INVALID_TOKEN";
  }

  return {
    statusCode,
    message,
    code,
    details: { originalError: err.message },
  };
}

export const errorHandler = (
  err: ErrorWithCode | HttpErrorWithDetails,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response | void => {
  // Handle HttpError instances (from createError)
  if (isHttpError(err)) {
    const errorCode = (err as ErrorWithCode).code || "HTTP_ERROR";
    return res
      .status(err.statusCode)
      .json(
        error(err.message, [errorCode], (err as HttpErrorWithDetails).details)
      );
  }

  // Handle Prisma errors
  if (err.code && typeof err.code === "string" && err.code.startsWith("P")) {
    const prismaError = createPrismaError(err);
    return res
      .status(prismaError.statusCode)
      .json(
        error(prismaError.message, [prismaError.code], prismaError.details)
      );
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    const jwtError = createJWTError(err);
    return res
      .status(jwtError.statusCode)
      .json(error(jwtError.message, [jwtError.code], jwtError.details));
  }

  // Handle validation errors from express-validator or similar
  if (err.name === "ValidationError" && err.field) {
    return res.status(422).json(
      error(err.message, ["VALIDATION_ERROR"], {
        field: err.field,
        reason: err.message,
      })
    );
  }

  // Handle specific error types by message content
  if (err.message.includes("not found")) {
    return res
      .status(404)
      .json(error(err.message, ["NOT_FOUND"], { resource: err.message }));
  }

  if (err.message.includes("Failed to") && err.message.includes("database")) {
    return res.status(500).json(
      error("Database operation failed", ["DATABASE_ERROR"], {
        message: err.message,
      })
    );
  }

  // Default to internal server error
  return res.status(500).json(
    error("An unexpected server error occurred", ["INTERNAL_SERVER_ERROR"], {
      message: err.message,
    })
  );
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
