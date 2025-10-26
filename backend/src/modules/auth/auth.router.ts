import express from "express";
import validate from "express-zod-safe";
const router = express.Router();

import authController from "./auth.controller";
import {
  otpRequestSchema,
  otpVerificationSchema,
  refreshTokenSchema,
} from "../../lib/validation";
import {
  authLimiter,
  refreshLimiter,
  otpSendLimiter,
  otpCheckLimiter,
} from "../../middleware/rate-limit.middleware";

router.post(
  "/refresh",
  refreshLimiter,
  validate({ body: refreshTokenSchema }),
  authController.refresh
);

router.post(
  "/sign-out",
  authLimiter,
  validate({ body: refreshTokenSchema }),
  authController.signOut
);

router.post(
  "/otp/send",
  otpSendLimiter,
  validate({ body: otpRequestSchema }),
  authController.otpSend
);

router.post(
  "/otp/check",
  otpCheckLimiter,
  validate({ body: otpVerificationSchema }),
  authController.otpCheck
);

export { router as authRouter };
