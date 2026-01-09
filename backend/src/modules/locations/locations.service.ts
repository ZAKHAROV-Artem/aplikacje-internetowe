import { prisma } from "../../lib/prisma";
import {
  CreateLocationInput,
  UpdateLocationInput,
  LocationResponse,
} from "./locations.types";
import { createError } from "@/lib/responses";

class LocationsService {
  async create(
    userId: string,
    data: CreateLocationInput
  ): Promise<LocationResponse> {
    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await prisma.location.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    // If it's the first location, make it default
    const count = await prisma.location.count({ where: { userId } });
    const isDefault = data.isDefault ?? count === 0;

    const location = await prisma.location.create({
      data: {
        userId,
        name: data.name || "Home",
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        isDefault,
      },
    });

    return this.mapToResponse(location);
  }

  async getById(id: string): Promise<LocationResponse> {
    const location = await prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      throw createError.NotFound("Location not found", { locationId: id });
    }

    return this.mapToResponse(location);
  }

  async update(
    id: string,
    data: UpdateLocationInput
  ): Promise<LocationResponse> {
    const currentLocation = await prisma.location.findUnique({
      where: { id },
    });

    if (!currentLocation) {
      throw createError.NotFound("Location not found", { locationId: id });
    }

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await prisma.location.updateMany({
        where: {
          userId: currentLocation.userId,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    const location = await prisma.location.update({
      where: { id },
      data,
    });

    return this.mapToResponse(location);
  }

  async delete(id: string): Promise<void> {
    await prisma.location.delete({
      where: { id },
    });
  }

  async list(userId: string): Promise<LocationResponse[]> {
    const locations = await prisma.location.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return locations.map((location) => this.mapToResponse(location));
  }

  private mapToResponse(location: any): LocationResponse {
    return {
      id: location.id,
      userId: location.userId,
      name: location.name,
      address: location.address,
      city: location.city,
      state: location.state,
      zip: location.zip,
      isDefault: location.isDefault,
      createdAt: location.createdAt.toISOString(),
      updatedAt: location.updatedAt.toISOString(),
    };
  }
}

const locationsService = new LocationsService();
export default locationsService;
