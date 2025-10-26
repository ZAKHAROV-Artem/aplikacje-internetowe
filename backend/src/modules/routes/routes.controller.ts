import { success } from "../../lib/http";
import { controllerHandler2 } from "../../utils/controllerHandler2";
import routesService from "../pickups/routes.service";
import { z } from "zod";

const createRouteSchema = z.object({
  companyId: z.string().uuid(),
  name: z.string().min(1),
  zipCodes: z.array(z.string()),
  weekdays: z.array(z.string()),
  startTimeMins: z.number(),
  endTimeMins: z.number(),
  pricelistId: z.string().optional(),
});

const updateRouteSchema = z.object({
  name: z.string().optional(),
  zipCodes: z.array(z.string()).optional(),
  weekdays: z.array(z.string()).optional(),
  startTimeMins: z.number().optional(),
  endTimeMins: z.number().optional(),
  pricelistId: z.string().optional(),
  active: z.boolean().optional(),
});

class RoutesController {
  create = controllerHandler2<any, unknown>(async (req, res) => {
    const data = createRouteSchema.parse(req.body);
    const route = await routesService.create(data);
    success(res, route);
  });

  getById = controllerHandler2<{ params: { id: string } }, unknown>(
    async (req, res) => {
      const route = await routesService.getById(req.params.id);
      success(res, route);
    }
  );

  update = controllerHandler2<{ params: { id: string }; body: any }, unknown>(
    async (req, res) => {
      const data = updateRouteSchema.parse(req.body);
      const route = await routesService.update(req.params.id, data);
      success(res, route);
    }
  );

  delete = controllerHandler2<{ params: { id: string } }, unknown>(
    async (req, res) => {
      await routesService.delete(req.params.id);
      success(res, { deleted: true });
    }
  );

  list = controllerHandler2<{ query: any }, unknown>(async (req, res) => {
    let filters: any = {};

    if (req.query.companyId) {
      filters.companyId = req.query.companyId;
    }

    if (req.query.active !== undefined) {
      filters.active = req.query.active === "true";
    }

    const routes = await routesService.list(filters);
    success(res, routes);
  });
}

const routesController = new RoutesController();
export default routesController;
