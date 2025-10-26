import { Request, Response, NextFunction } from "express";
import { authTokenService  } from "../lib/auth-token.service";

/**
 * Middleware to capture the Authorization token from incoming requests
 * and store it globally for use in outgoing API calls to external services.
 */
const captureAuthToken = (req: Request, _: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    authTokenService.setToken(token);
  } else {
    // Clear any existing token if no valid auth header is present
    authTokenService.clearToken();
  }

  next();
};

export { captureAuthToken  };
