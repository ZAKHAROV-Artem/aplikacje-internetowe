import { Request, Response, NextFunction } from "express";
import {
  fail,
  AppError,
  isAppError,
  createPrismaError,
  createJWTError,
} from "../lib/http";

export interface ErrorWithCode extends Error {
  code?: string;
  status?: number;
  field?: string;
  service?: string;
}

export const errorHandler = (
  err: ErrorWithCode | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response | void => {
  // Handle AppError instances
  if (isAppError(err)) {
    return fail(res, err.statusCode, err.code, err.message, err.details);
  }

  // Handle Prisma errors
  if (err.code && typeof err.code === "string" && err.code.startsWith("P")) {
    const prismaError = createPrismaError(err);
    return fail(
      res,
      prismaError.statusCode,
      prismaError.code,
      prismaError.message,
      prismaError.details
    );
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    const jwtError = createJWTError(err);
    return fail(
      res,
      jwtError.statusCode,
      jwtError.code,
      jwtError.message,
      jwtError.details
    );
  }

  // Handle validation errors from express-validator or similar
  if (err.name === "ValidationError" && err.field) {
    return fail(res, 422, "VALIDATION_ERROR", err.message, {
      field: err.field,
      reason: err.message,
    });
  }

  // Handle specific error types by message content
  if (err.message.includes("not found")) {
    return fail(res, 404, "NOT_FOUND", err.message, { resource: err.message });
  }

  if (err.message.includes("Failed to") && err.message.includes("database")) {
    return fail(res, 500, "DATABASE_ERROR", "Database operation failed", {
      message: err.message,
    });
  }

  // Default to internal server error
  return fail(
    res,
    500,
    "INTERNAL_SERVER_ERROR",
    "An unexpected server error occurred",
    {
      message: err.message,
    }
  );
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
