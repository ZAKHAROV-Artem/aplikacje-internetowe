import { Router } from "express";
import validate from "express-zod-safe";
import { idParamSchema } from "../../lib/validation";
import { generalLimiter } from "../../middleware/rate-limit.middleware";
import {
  requireAdmin,
  requireManagerOrAdmin,
} from "../../middleware/role-check.middleware";
import companiesController from "./companies.controller";

const router = Router();

router.use(generalLimiter);

// Public route to get company info (no auth needed for display)
router.get("/info", companiesController.getInfo);

// Admin-only routes
router.post("/", requireAdmin, companiesController.create);
router.get("/", requireManagerOrAdmin, companiesController.list);
router.get(
  "/:id",
  validate({ params: idParamSchema }),
  requireManagerOrAdmin,
  companiesController.getById
);
router.patch(
  "/:id",
  validate({ params: idParamSchema }),
  requireAdmin,
  companiesController.update
);
router.delete(
  "/:id",
  validate({ params: idParamSchema }),
  requireAdmin,
  companiesController.delete
);

export { router as companiesRouter };
