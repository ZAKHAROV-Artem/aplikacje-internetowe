import { prisma } from "../../lib/prisma";
import { createError } from "@/lib/responses";
import locationsService from "../locations/locations.service";

// Interface matching internal User model
interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class CustomersService {
  async upsertByEmail(email: string) {
    if (!email || typeof email !== "string") {
      throw createError.BadRequest("email is required");
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        locations: {
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        },
      },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          firstName: "",
          lastName: "",
          role: "USER",
        },
        include: {
          locations: true,
        },
      });
    }

    return {
      ...user,
    };
  }

  async getById(id: string) {
    if (!id || typeof id !== "string") {
      throw createError.BadRequest("id is required");
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        locations: {
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        },
      },
    });

    if (!user) {
      throw createError.NotFound("Customer not found", { id });
    }

    // Add metadata field for frontend compatibility
    // Admin and Company Manager users are automatically onboarded
    const isAdminOrManager =
      user.role === "ADMIN" || user.role === "COMPANY_MANAGER";
    const isOnboarded = isAdminOrManager || (user.firstName && user.lastName);

    // Map locations to expected format for frontend
    const customerLocations = user.locations.map((loc) => ({
      id: loc.id,
      alias: loc.isDefault
        ? "default"
        : loc.name.toLowerCase().replace(/\s+/g, "-"),
      address1: loc.address,
      city: loc.city,
      state: loc.state,
      zip: loc.zip,
      country: "US", // Default country
      owner: loc.userId,
      active: true,
      default: loc.isDefault,
      createdAt: loc.createdAt.toISOString(),
      updatedAt: loc.updatedAt.toISOString(),
    }));

    return {
      ...user,
      customerLocations,
      metadata: {
        isOnboarded,
      },
    };
  }

  async update(id: string, data: Partial<Customer> & { location?: any }) {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.email && { email: data.email }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    // Save location if provided
    if (data.location && typeof data.location === "object") {
      await locationsService.create(id, {
        name: data.location.name || "Home",
        address: data.location.address,
        city: data.location.city,
        state: data.location.state,
        zip: data.location.zip,
        isDefault: true, // First location is default
      });
    }

    // Add metadata field for frontend compatibility
    const isAdminOrManager =
      user.role === "ADMIN" || user.role === "COMPANY_MANAGER";
    const isOnboarded = isAdminOrManager || (user.firstName && user.lastName);

    return {
      ...user,
      metadata: {
        isOnboarded,
      },
    };
  }

  // These methods are deprecated in internal system
  async getCustomerRules(_customerId: string) {
    // No longer needed in internal system
    return [];
  }

  async toggleCustomerRule(isActive: boolean, _ruleId: string) {
    // No longer needed in internal system
    return { isActive };
  }
}

const customersService = new CustomersService();
export default customersService;
