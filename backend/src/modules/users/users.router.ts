import { Router } from "express";
import validate from "express-zod-safe";
import { idParamSchema } from "../../lib/validation";
import usersController from "./users.controller";

const router = Router();

// Public user routes
router.get("/me", usersController.getMe);
router.patch("/me", usersController.updateMe);

// Admin-only routes - temporarily removed auth
router.post("/", usersController.create);
router.get("/", usersController.list);
router.get(
  "/:id",
  validate({ params: idParamSchema }),
  usersController.getById
);
router.patch(
  "/:id",
  validate({ params: idParamSchema }),
  usersController.update
);
router.delete(
  "/:id",
  validate({ params: idParamSchema }),
  usersController.delete
);

export { router as usersRouter };
