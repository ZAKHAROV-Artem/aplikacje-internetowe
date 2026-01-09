import pickupsController from "./pickups.controller";
import { requireAuth, requireManagerJWT } from "../auth/shared/require-auth";
import { Router } from "express";
import validate from "express-zod-safe";
import {
  idParamSchema,
  pickupStatusUpdateSchema,
  bulkPickupStatusUpdateSchema,
} from "../../lib/validation";
import {
  pickupLimiter,
  generalLimiter,
} from "../../middleware/rate-limit.middleware";
import { pickupRequestCreateInputSchema } from "magnoli-types";
import { z } from "zod";

const router = Router();

// Create custom schema that makes routeId optional
const pickupRequestCreateInputSchemaOptional = pickupRequestCreateInputSchema.extend({
  routeId: z.string().optional(),
});

// GET requires auth for filtering by user role
router.get("/", requireAuth, pickupsController.get);

router.post(
  "/",
  pickupLimiter,
  requireAuth,
  validate({ body: pickupRequestCreateInputSchemaOptional }),
  pickupsController.create
);

router.patch(
  "/bulk/status",
  generalLimiter,
  requireManagerJWT,
  validate({
    body: bulkPickupStatusUpdateSchema,
  }),
  pickupsController.bulkUpdateStatus
);

router.get(
  "/:id",
  generalLimiter,
  requireAuth,
  validate({ params: idParamSchema }),
  pickupsController.getById
);

router.patch(
  "/:id/status",
  generalLimiter,
  requireManagerJWT,
  validate({
    params: idParamSchema,
    body: pickupStatusUpdateSchema,
  }),
  pickupsController.updateStatus
);

export { router as pickupsRouter };
