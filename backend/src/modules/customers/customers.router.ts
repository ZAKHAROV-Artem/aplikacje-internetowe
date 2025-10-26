import { Router } from "express";
import validate from "express-zod-safe";

import customersController from "./customers.controller";
import { requireAuth } from "../auth/shared/require-auth";
import { customerUpdateInputSchemaCrm } from "magnoli-types";

const router = Router();
router.get("/me", requireAuth, customersController.getMe);

router.patch(
  "/me",
  requireAuth,
  validate({ body: customerUpdateInputSchemaCrm }),
  customersController.updateMe
);

router.get(
  "/rules/:customerId",
  requireAuth,
  customersController.getCustomerRules
);
router.patch(
  "/rules/:ruleId/toggle",
  requireAuth,
  customersController.toggleCustomerRule
);

export { router as customersRouter };
