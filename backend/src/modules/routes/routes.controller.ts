import { success } from "../../lib/responses";
import { controllerHandler } from "../../utils/controllerHandler";
import routesService from "../pickups/routes.service";
import { z } from "zod";

// Accepts AM/PM format like "8:00 AM", "12:30 PM"
const timeRegex = /^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/;

const createRouteSchema = z.object({
  companyId: z.string().uuid(),
  name: z.string().min(1),
  zipCodes: z.array(z.string()),
  weekdays: z.array(z.string()),
  startTime: z.string().regex(timeRegex, "Time must be in H:MM AM/PM format (e.g., 8:00 AM)"),
  endTime: z.string().regex(timeRegex, "Time must be in H:MM AM/PM format (e.g., 6:00 PM)"),
  pricelistId: z.string().optional(),
});

export const updateRouteSchema = z.object({
  name: z.string().optional(),
  zipCodes: z.array(z.string()).optional(),
  weekdays: z.array(z.string()).optional(),
  startTime: z.string().regex(timeRegex, "Time must be in H:MM AM/PM format (e.g., 8:00 AM)").optional(),
  endTime: z.string().regex(timeRegex, "Time must be in H:MM AM/PM format (e.g., 6:00 PM)").optional(),
  pricelistId: z.string().optional(),
  active: z.boolean().optional(),
});

class RoutesController {
  create = controllerHandler<any, unknown>(async (req, res) => {
    const data = createRouteSchema.parse(req.body);
    const route = await routesService.create(data);
    res.status(201).json(success(route, "Route created successfully"));
  });

  getById = controllerHandler<{ params: { id: string } }, unknown>(
    async (req, res) => {
      const route = await routesService.getById(req.params.id);
      res.status(200).json(success(route, "Route retrieved successfully"));
    }
  );

  update = controllerHandler<{ params: { id: string }; body: any }, unknown>(
    async (req, res) => {
      const data = updateRouteSchema.parse(req.body);
      const route = await routesService.update(req.params.id, data);
      res.status(200).json(success(route, "Route updated successfully"));
    }
  );

  delete = controllerHandler<{ params: { id: string } }, unknown>(
    async (req, res) => {
      await routesService.delete(req.params.id);
      res.status(200).json(success({ deleted: true }, "Route deleted successfully"));
    }
  );

  list = controllerHandler<{ query: any }, unknown>(async (req, res) => {
    let filters: any = {};

    if (req.query.companyId) {
      filters.companyId = req.query.companyId;
    }

    if (req.query.active !== undefined) {
      filters.active = req.query.active === "true";
    }

    const routes = await routesService.list(filters);
    res.status(200).json(success(routes, "Routes retrieved successfully"));
  });
}

const routesController = new RoutesController();
export default routesController;
