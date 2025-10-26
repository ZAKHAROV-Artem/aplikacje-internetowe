import express from "express";
import validate from "express-zod-safe";

import deliveryAppSettingsController from "./delivery-app-settings.controller";
import { requireAuth, hqJWT } from "../auth/shared/require-auth";
import { OR } from "../../middleware/logic.middleware";
import { deliveryAppSettingsUpdateInputSchema } from "magnoli-types";

const router = express.Router();

router.get("/", deliveryAppSettingsController.get);
router.get(
  "/by-magnoli-customer",
  OR(requireAuth, hqJWT),
  deliveryAppSettingsController.getByMagnoliCustomerId
);
router.post(
  "/by-magnoli-customer",
  OR(requireAuth, hqJWT),
  validate({ body: deliveryAppSettingsUpdateInputSchema }),
  deliveryAppSettingsController.upsertForMagnoliCustomer
);

export { router as deliveryAppSettingsRouter };
