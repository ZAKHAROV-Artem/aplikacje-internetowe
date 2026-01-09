import { Router } from "express";
import validate from "express-zod-safe";
import { idParamSchema, zipParamSchema } from "../../lib/validation";
import routesService from "../pickups/routes.service";
import routesController, { updateRouteSchema } from "./routes.controller";
import { success, error } from "../../lib/responses";
import { requireManagerJWT } from "../auth/shared/require-auth";

const router = Router();

// Public route - get routes by ZIP code
router.get(
  "/zip/:zip",
  validate({ params: zipParamSchema }),
  async (req, res) => {
    try {
      const routes = await routesService.getRoutesByZip(req.params.zip);
      res.status(200).json(success({ data: routes }, "Routes retrieved successfully"));
    } catch (err) {
      res.status(500).json(
        error("Failed to get routes by zip", ["INTERNAL_SERVER_ERROR"], {
          message: err && (err as any).message,
        })
      );
      return;
    }
  }
);

// Protected CRUD routes - Admin and Manager only
router.post("/", requireManagerJWT, routesController.create);
router.get("/", requireManagerJWT, routesController.list);
router.get(
  "/:id",
  requireManagerJWT,
  validate({ params: idParamSchema }),
  routesController.getById
);
router.patch(
  "/:id",
  requireManagerJWT,
  validate({ params: idParamSchema, body: updateRouteSchema }),
  routesController.update
);
router.delete(
  "/:id",
  requireManagerJWT,
  validate({ params: idParamSchema }),
  routesController.delete
);

export { router as routesRouter };
