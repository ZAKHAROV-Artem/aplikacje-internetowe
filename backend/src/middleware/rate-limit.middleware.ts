import rateLimit from "express-rate-limit";

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests from this IP, please try again later.",
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Rate limiter for auth endpoints (login, verify, etc.)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: {
    success: false,
    error: {
      code: "AUTH_RATE_LIMIT_EXCEEDED",
      message: "Too many authentication attempts, please try again later.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// More lenient rate limiter for refresh endpoints
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 refresh requests per windowMs
  message: {
    success: false,
    error: {
      code: "REFRESH_RATE_LIMIT_EXCEEDED",
      message: "Too many token refresh attempts, please try again later.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP send rate limiter (more restrictive to prevent spam)
export const otpSendLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 OTP send requests per minute
  message: {
    success: false,
    error: {
      code: "OTP_SEND_RATE_LIMIT_EXCEEDED",
      message:
        "Too many OTP requests, please wait before requesting another code.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP check rate limiter (more lenient for verification attempts)
export const otpCheckLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // limit each IP to 15 OTP check requests per minute
  message: {
    success: false,
    error: {
      code: "OTP_CHECK_RATE_LIMIT_EXCEEDED",
      message:
        "Too many OTP verification attempts, please wait before trying again.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Pickup creation rate limiter
export const pickupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 pickup requests per hour
  message: {
    success: false,
    error: {
      code: "PICKUP_RATE_LIMIT_EXCEEDED",
      message: "Too many pickup requests, please try again later.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
