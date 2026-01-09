import { Router } from "express";
import validate from "express-zod-safe";
import { idParamSchema } from "../../lib/validation";
import usersController from "./users.controller";
import { requireAdminJWT } from "../auth/shared/require-auth";

const router = Router();

// Public user routes
router.get("/me", usersController.getMe);
router.patch("/me", usersController.updateMe);

// Admin-only routes
router.post("/", requireAdminJWT, usersController.create);
router.get("/", requireAdminJWT, usersController.list);
router.get(
  "/:id",
  requireAdminJWT,
  validate({ params: idParamSchema }),
  usersController.getById
);
router.patch(
  "/:id",
  requireAdminJWT,
  validate({ params: idParamSchema }),
  usersController.update
);
router.delete(
  "/:id",
  requireAdminJWT,
  validate({ params: idParamSchema }),
  usersController.delete
);

export { router as usersRouter };
