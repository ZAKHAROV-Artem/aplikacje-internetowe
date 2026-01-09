import { Router } from "express";
import validate from "express-zod-safe";
import { idParamSchema } from "../../lib/validation";
import { generalLimiter } from "../../middleware/rate-limit.middleware";
import {
  requireAuth,
  requireAdminJWT,
} from "../../modules/auth/shared/require-auth";
import companiesController from "./companies.controller";
import { z } from "zod";

const updateCompanyBodySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  logo: z.string().nullable().optional(),
  managerId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

const router = Router();

router.use(generalLimiter);

// Public route to get company info (no auth needed for display)
router.get("/info", companiesController.getInfo);

// Admin-only routes
router.post("/", requireAdminJWT, companiesController.create);
router.get("/", requireAuth, companiesController.list);
router.get(
  "/:id",
  validate({ params: idParamSchema }),
  requireAuth,
  companiesController.getById
);
router.patch(
  "/:id",
  validate({ params: idParamSchema, body: updateCompanyBodySchema }),
  requireAdminJWT,
  companiesController.update
);
router.delete(
  "/:id",
  validate({ params: idParamSchema }),
  requireAdminJWT,
  companiesController.delete
);

export { router as companiesRouter };
