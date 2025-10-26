import { prisma } from "../../lib/prisma";
import { NotFoundError } from "../../lib/http";

interface CreateRouteInput {
  companyId: string;
  name: string;
  zipCodes: string[];
  weekdays: string[];
  startTimeMins: number;
  endTimeMins: number;
  pricelistId?: string;
}

interface UpdateRouteInput {
  name?: string;
  zipCodes?: string[];
  weekdays?: string[];
  startTimeMins?: number;
  endTimeMins?: number;
  pricelistId?: string;
  active?: boolean;
}

interface RouteResponse {
  id: string;
  companyId: string;
  name: string;
  zipCodes: string[];
  weekdays: string[];
  startTimeMins: number;
  endTimeMins: number;
  pricelistId: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class RoutesService {
  async create(data: CreateRouteInput): Promise<RouteResponse> {
    const route = await prisma.route.create({
      data,
    });

    return this.mapToResponse(route);
  }

  async getById(id: string): Promise<RouteResponse> {
    const route = await prisma.route.findUnique({
      where: { id },
      include: {
        company: true,
      },
    });

    if (!route) {
      throw new NotFoundError("Route not found", { routeId: id });
    }

    return this.mapToResponse(route);
  }

  async update(id: string, data: UpdateRouteInput): Promise<RouteResponse> {
    const route = await prisma.route.update({
      where: { id },
      data,
    });

    return this.mapToResponse(route);
  }

  async delete(id: string): Promise<void> {
    await prisma.route.delete({
      where: { id },
    });
  }

  async list(filters?: { companyId?: string; active?: boolean }) {
    const routes = await prisma.route.findMany({
      where: {
        ...(filters?.companyId && { companyId: filters.companyId }),
        ...(filters?.active !== undefined && { active: filters.active }),
      },
      include: {
        company: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return routes.map((route) => this.mapToResponse(route));
  }

  async getRoutesByZip(zip: string) {
    const routes = await prisma.route.findMany({
      where: {
        zipCodes: {
          has: zip,
        },
        active: true,
      },
      include: {
        company: true,
      },
    });

    return routes.map((route) => this.mapToResponse(route));
  }

  async getByCompany(companyId: string) {
    const routes = await this.list({ companyId, active: true });
    return routes;
  }

  private mapToResponse(route: any): RouteResponse {
    return {
      id: route.id,
      companyId: route.companyId,
      name: route.name,
      zipCodes: route.zipCodes,
      weekdays: route.weekdays,
      startTimeMins: route.startTimeMins,
      endTimeMins: route.endTimeMins,
      pricelistId: route.pricelistId,
      active: route.active,
      createdAt: route.createdAt,
      updatedAt: route.updatedAt,
    };
  }
}

const routesService = new RoutesService();
export default routesService;
