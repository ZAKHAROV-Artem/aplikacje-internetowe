import { z } from "zod";

// Common validation schemas
export const uuidSchema = z.string().uuid();
export const emailSchema = z.string().email("Invalid email format");

// Auth schemas
export const otpRequestSchema = z.object({
  to: emailSchema,
});

export const otpVerificationSchema = z.object({
  to: emailSchema,
  code: z.string().length(6, "Code must be 6 digits"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const passwordLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Route parameter schemas
export const idParamSchema = z.object({
  id: uuidSchema,
});

export const zipParamSchema = z.object({
  zip: z.string().min(5).max(10),
});

// Pickup request schemas
export const pickupStatusUpdateSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "IN_TRANSIT",
    "DELIVERED",
    "CANCELLED",
  ]),
});

export const bulkPickupStatusUpdateSchema = z.object({
  ids: z.array(uuidSchema).min(1, "At least one ID is required"),
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "IN_TRANSIT",
    "DELIVERED",
    "CANCELLED",
  ]),
});
