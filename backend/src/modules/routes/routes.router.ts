import { Router } from "express";
import validate from "express-zod-safe";
import { idParamSchema, zipParamSchema } from "../../lib/validation";
import routesService from "../pickups/routes.service";
import routesController from "./routes.controller";
import { success, fail } from "../../lib/http";

const router = Router();

// Public route - get routes by ZIP code
router.get(
  "/zip/:zip",
  validate({ params: zipParamSchema }),
  async (req, res) => {
    try {
      const data = await routesService.getRoutesByZip(req.params.zip);
      success(res, data);
    } catch (err) {
      fail(res, 500, "INTERNAL_SERVER_ERROR", "Failed to get routes by zip", {
        message: err && (err as any).message,
      });
      return;
    }
  }
);

// Protected CRUD routes
router.post("/", routesController.create);
router.get("/", routesController.list);
router.get(
  "/:id",
  validate({ params: idParamSchema }),
  routesController.getById
);
router.patch(
  "/:id",
  validate({ params: idParamSchema }),
  routesController.update
);
router.delete(
  "/:id",
  validate({ params: idParamSchema }),
  routesController.delete
);

export { router as routesRouter };
