import pickupsController from "./pickups.controller";
import { requireAuth } from "../auth/shared/require-auth";
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

const router = Router();

router.get("/", pickupsController.get);

router.post(
  "/",
  pickupLimiter,
  requireAuth,
  validate({ body: pickupRequestCreateInputSchema }),
  pickupsController.create
);

router.patch(
  "/bulk/status",
  generalLimiter,
  requireAuth,
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
  requireAuth,
  validate({
    params: idParamSchema,
    body: pickupStatusUpdateSchema,
  }),
  pickupsController.updateStatus
);

export { router as pickupsRouter };
