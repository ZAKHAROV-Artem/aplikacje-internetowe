import { success, fail } from "../../lib/http";
import pickupsService from "./pickups.service";
import analyticsService from "../analytics/analytics.service";
import {
  authenticatedControllerHandler2,
  controllerHandler2,
} from "../../utils/controllerHandler2";

class PickupsController {
  get = controllerHandler2<
    { query: { page?: number; limit?: number } },
    unknown
  >(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const data = await pickupsService.get({ page, limit });
    success(res, data);
  });

  getById = controllerHandler2<{ params: { id: string } }, unknown>(
    async (req, res) => {
      const data = await pickupsService.getById(req.params.id);
      success(res, data);
    }
  );

  create = authenticatedControllerHandler2<any, unknown>(async (req, res) => {
    const userId = (req as any).user?.sub;
    if (!userId) {
      fail(
        res,
        401,
        "UNAUTHORIZED",
        "User ID not found in authentication token",
        {}
      );
      return;
    }

    // Get user's companyId from auth token
    const companyId = (req as any).user?.companyId;
    if (!companyId) {
      fail(
        res,
        400,
        "BAD_REQUEST",
        "User must be associated with a company",
        {}
      );
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

    success(res, data);
  });

  updateStatus = authenticatedControllerHandler2<
    { params: { id: string }; body: { status: string } },
    unknown
  >(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const data = await pickupsService.updateStatus(id, status);
    success(res, data);
  });

  bulkUpdateStatus = authenticatedControllerHandler2<
    { body: { ids: string[]; status: string } },
    unknown
  >(async (req, res) => {
    const { ids, status } = req.body;

    const data = await pickupsService.bulkUpdateStatus(ids, status);
    success(res, data);
  });
}

const pickupsController = new PickupsController();

export default pickupsController;
