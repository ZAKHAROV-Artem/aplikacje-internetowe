import { DeliveryAppSettings } from "magnoli-types";
import { prisma } from "../../lib/prisma";

class DeliveryAppSettingsService {
  async getById(id: string) {
    try {
      const settings = await prisma.deliveryAppSettings.findUnique({
        where: { id },
      });
      return { success: true, data: settings };
    } catch (error) {
      return {
        success: false,
        error: {
          statusCode: 500,
          code: "DATABASE_ERROR",
          message: "Failed to get delivery app settings by id",
          details: { error: String(error) },
        },
      };
    }
  }

  async getByMagnoliCustomerId(magnoliCustomerId: string) {
    try {
      const settings = await prisma.deliveryAppSettings.findFirst({
        where: { magnoliCustomerId },
      });
      return { success: true, data: settings };
    } catch (error) {
      return {
        success: false,
        error: {
          statusCode: 500,
          code: "DATABASE_ERROR",
          message: "Failed to get delivery app settings by magnoli customer id",
          details: { error: String(error) },
        },
      };
    }
  }

  async upsertByMagnoliCustomerId(
    magnoliCustomerId: string,
    settings?: DeliveryAppSettings
  ) {
    try {
      const result = await prisma.deliveryAppSettings.upsert({
        where: { magnoliCustomerId },
        update: {
          deliveryAppUrl: settings?.deliveryAppUrl ?? "",
          settings: settings?.settings ?? {},
        },
        create: {
          magnoliCustomerId,
          deliveryAppUrl: settings?.deliveryAppUrl ?? "",
          settings: settings?.settings ?? {},
        },
      });
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: {
          statusCode: 500,
          code: "DATABASE_ERROR",
          message: "Failed to upsert delivery app settings",
          details: { error: String(error) },
        },
      };
    }
  }

  async getByDeliveryAppUrl(deliveryAppUrl: string) {
    try {
      const settings = await prisma.deliveryAppSettings.findFirst({
        where: {
          deliveryAppUrl: {
            contains: deliveryAppUrl,
            mode: "insensitive",
          },
        },
      });
      return { success: true, data: settings };
    } catch (error) {
      return {
        success: false,
        error: {
          statusCode: 500,
          code: "DATABASE_ERROR",
          message: "Failed to get delivery app settings by delivery app url",
          details: { error: String(error) },
        },
      };
    }
  }
}

const deliveryAppSettingsService = new DeliveryAppSettingsService();
export default deliveryAppSettingsService;
