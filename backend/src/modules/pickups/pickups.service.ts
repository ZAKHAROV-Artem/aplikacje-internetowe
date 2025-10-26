import { prisma } from "../../lib/prisma";
import { NotFoundError } from "../../lib/http";

interface PickupRequestCreateInput {
  userId: string;
  routeId: string;
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
  }: {
    page?: number;
    limit?: number;
  } = {}) {
    // Get total count for pagination metadata
    const total = await prisma.pickupRequest.count();
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const pickupRequests = await prisma.pickupRequest.findMany({
      include: {
        user: true,
        route: true,
        company: true,
        location: true,
      },
      orderBy: {
        createdAt: "desc",
      },
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

  async getById(id: string) {
    const pickupRequest = await prisma.pickupRequest.findUnique({
      where: { id },
      include: {
        user: true,
        route: true,
        company: true,
      },
    });

    if (!pickupRequest) {
      throw new NotFoundError("Pickup request not found", { id });
    }

    return pickupRequest;
  }

  async create(body: PickupRequestCreateInput) {
    const pickupRequest = await prisma.pickupRequest.create({
      data: {
        userId: body.userId,
        routeId: body.routeId,
        companyId: body.companyId,
        locationId: body.locationId,
        pickupDate: new Date(body.pickupDate),
        dropoffDate: new Date(body.dropoffDate),
        notes: body.notes,
        status: "PENDING",
      },
      include: {
        user: true,
        route: true,
        company: true,
        location: true,
      },
    });

    return pickupRequest;
  }

  async updateStatus(id: string, status: string) {
    const pickupRequest = await prisma.pickupRequest.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        route: true,
        company: true,
        location: true,
      },
    });

    return pickupRequest;
  }

  async bulkUpdateStatus(ids: string[], status: string) {
    const result = await prisma.pickupRequest.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    return result;
  }
}

const pickupsService = new PickupsService();
export default pickupsService;
