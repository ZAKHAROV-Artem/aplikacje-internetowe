import { createError } from "@/lib/responses";
import { prisma } from "../../lib/prisma";

interface PickupRequestCreateInput {
  userId: string;
  routeId?: string;
  companyId: string;
  locationId?: string;
  pickupDate: string | Date;
  dropoffDate: string | Date;
  notes?: string;
}

class PickupsService {
  async get({
    page = 1,
    limit = 10,
    userId,
    userRole,
  }: {
    page?: number;
    limit?: number;
    userId?: string;
    userRole?: string;
  } = {}) {
    // Regular users can only see their own pickup requests
    // Admin and Manager can see all
    const whereClause: any = {};
    if (userRole === "USER" && userId) {
      whereClause.userId = userId;
    }

    // Get total count for pagination metadata
    const total = await prisma.pickupRequest.count({
      where: whereClause,
    });
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const pickupRequests = await prisma.pickupRequest.findMany({
      where: whereClause,
      include: {
        user: true,
        route: true,
        company: true,
        location: true,
      },
      orderBy: [
        {
          pickupDate: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: pickupRequests,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getById(id: string, userId?: string, userRole?: string) {
    const whereClause: any = { id };

    // Regular users can only see their own pickup requests
    if (userRole === "USER" && userId) {
      whereClause.userId = userId;
    }

    const pickupRequest = await prisma.pickupRequest.findFirst({
      where: whereClause,
      include: {
        user: true,
        route: true,
        company: true,
      },
    });

    if (!pickupRequest) {
      throw createError.NotFound("Pickup request not found", { id });
    }

    return pickupRequest;
  }

  async create(body: PickupRequestCreateInput) {
    let selectedRouteId: string | undefined = body.routeId;
    let location: { zip: string; userId: string } | null = null;

    // Validate location exists and belongs to the user (if provided)
    if (body.locationId) {
      const locationData = await prisma.location.findUnique({
        where: { id: body.locationId },
        select: {
          zip: true,
          userId: true,
        },
      });

      if (!locationData) {
        throw createError.BadRequest("Location not found", {
          locationId: body.locationId,
        });
      }

      if (locationData.userId !== body.userId) {
        throw createError.BadRequest("Location does not belong to the user", {
          locationId: body.locationId,
          userId: body.userId,
        });
      }

      location = locationData;
    }

    // If routeId is not provided, try to find route based on location zipcode
    if (!selectedRouteId && location) {
      // Find routes by zipcode that belong to the company
      const routes = await prisma.route.findMany({
        where: {
          companyId: body.companyId,
          zipCodes: {
            has: location.zip,
          },
          active: true,
        },
      });

      if (routes.length === 1) {
        // Auto-select if only one route found
        selectedRouteId = routes[0].id;
      } else if (routes.length > 1) {
        // Multiple routes found - require routeId to be specified
        throw createError.BadRequest(
          "Multiple routes found for this location. Please select a route",
          {
            routes: routes.map((r) => ({ id: r.id, name: r.name })),
            zipCode: location.zip,
          }
        );
      }
      // If no routes found, selectedRouteId remains undefined (routeId is optional)
    }

    // Validate route exists, is active, and belongs to the company (if routeId is provided)
    if (selectedRouteId) {
      const route = await prisma.route.findUnique({
        where: { id: selectedRouteId },
      });

      if (!route) {
        throw createError.BadRequest("Route not found", {
          routeId: selectedRouteId,
        });
      }

      if (!route.active) {
        throw createError.BadRequest("Route is not active", {
          routeId: selectedRouteId,
        });
      }

      if (route.companyId !== body.companyId) {
        throw createError.BadRequest(
          "Route does not belong to the specified company",
          {
            routeId: selectedRouteId,
            companyId: body.companyId,
          }
        );
      }
    }

    // Validate user exists and belongs to the company
    const user = await prisma.user.findUnique({
      where: { id: body.userId },
    });

    if (!user) {
      throw createError.BadRequest("User not found", {
        userId: body.userId,
      });
    }

    if (user.companyId !== body.companyId) {
      throw createError.BadRequest(
        "User does not belong to the specified company",
        {
          userId: body.userId,
          companyId: body.companyId,
        }
      );
    }

    const pickupRequest = await prisma.pickupRequest.create({
      data: {
        userId: body.userId,
        ...(selectedRouteId ? { routeId: selectedRouteId } : { routeId: null }),
        companyId: body.companyId,
        locationId: body.locationId || null,
        pickupDate: new Date(body.pickupDate),
        dropoffDate: new Date(body.dropoffDate),
        notes: body.notes || null,
        status: "PENDING",
      } as any, // Type assertion until Prisma client is regenerated after schema change
      include: {
        user: true,
        route: true,
        company: true,
        location: true,
      },
    });

    return pickupRequest;
  }

  async updateStatus(id: string, status: string, userRole?: string) {
    // Regular users cannot update status (only admin/manager can)
    if (userRole === "USER") {
      throw createError.Forbidden(
        "Only admin or manager can update pickup status"
      );
    }

    const whereClause: any = { id };

    const pickupRequest = await prisma.pickupRequest.findFirst({
      where: whereClause,
    });

    if (!pickupRequest) {
      throw createError.NotFound("Pickup request not found", { id });
    }

    const updated = await prisma.pickupRequest.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        route: true,
        company: true,
        location: true,
      },
    });

    return updated;
  }

  async bulkUpdateStatus(ids: string[], status: string, userRole?: string) {
    // Regular users cannot update status (only admin/manager can)
    if (userRole === "USER") {
      throw createError.Forbidden(
        "Only admin or manager can update pickup status"
      );
    }

    const result = await prisma.pickupRequest.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    return result;
  }
}

const pickupsService = new PickupsService();
export default pickupsService;
