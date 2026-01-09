import { success, error } from "../../lib/responses";
import pickupsService from "./pickups.service";
import analyticsService from "../analytics/analytics.service";
import {
  authenticatedControllerHandler,
  controllerHandler,
} from "../../utils/controllerHandler";

class PickupsController {
  get = controllerHandler<
    { query: { page?: number; limit?: number } },
    unknown
  >(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    // Get user info from JWT token if authenticated (for filtering)
    const userId = (req as any).user?.sub;
    const userRole = (req as any).user?.role;

    const data = await pickupsService.get({ page, limit, userId, userRole });
    res.status(200).json(success(data, "Pickups retrieved successfully"));
  });

  getById = authenticatedControllerHandler<{ params: { id: string } }, unknown>(
    async (req, res) => {
      const userId = (req as any).user?.sub;
      const userRole = (req as any).user?.role;
      const data = await pickupsService.getById(
        req.params.id,
        userId,
        userRole
      );
      res.status(200).json(success(data, "Pickup retrieved successfully"));
    }
  );

  create = authenticatedControllerHandler<any, unknown>(async (req, res) => {
    const userId = (req as any).user?.sub;
    if (!userId) {
      res
        .status(401)
        .json(
          error("User ID not found in authentication token", ["UNAUTHORIZED"])
        );
      return;
    }

    // Get user's companyId from auth token
    const companyId = (req as any).user?.companyId;
    if (!companyId) {
      res
        .status(400)
        .json(error("User must be associated with a company", ["BAD_REQUEST"]));
      return;
    }

    const body = {
      ...(req.body as any),
      userId,
      companyId,
    };

    const data = await pickupsService.create(body);

    try {
      await analyticsService.record("CREATE_PICKUP_REQUEST", {
        customerId: userId,
        payload: {
          request_id: data?.id,
          scheduled_at: (req.body as any)?.dropoffDate,
          pickup_location_id: (req.body as any)?.addressId,
          channel: "web",
          email: (req as any).user?.email,
        },
      });
    } catch (error) {
      // Analytics failure shouldn't break the request
    }

    res.status(201).json(success(data, "Pickup created successfully"));
  });

  updateStatus = authenticatedControllerHandler<
    { params: { id: string }; body: { status: string } },
    unknown
  >(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const userRole = (req as any).user?.role;

    const data = await pickupsService.updateStatus(id, status, userRole);
    res.status(200).json(success(data, "Pickup status updated successfully"));
  });

  bulkUpdateStatus = authenticatedControllerHandler<
    { body: { ids: string[]; status: string } },
    unknown
  >(async (req, res) => {
    const { ids, status } = req.body;
    const userRole = (req as any).user?.role;

    const data = await pickupsService.bulkUpdateStatus(ids, status, userRole);
    res.status(200).json(success(data, "Pickup statuses updated successfully"));
  });
}

const pickupsController = new PickupsController();

export default pickupsController;
