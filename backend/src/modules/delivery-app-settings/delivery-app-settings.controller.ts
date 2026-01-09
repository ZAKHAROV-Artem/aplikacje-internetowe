import { success, error } from "../../lib/responses";
import deliveryAppSettingsService from "./delivery-app-settings.service";
import {
  authenticatedControllerHandler,
  controllerHandler,
} from "../../utils/controllerHandler";
import { ApiResponse, DeliveryAppSettings } from "magnoli-types";

class DeliveryAppSettingsController {
  upsertForMagnoliCustomer = authenticatedControllerHandler<
    { body: DeliveryAppSettings },
    ApiResponse<DeliveryAppSettings | null>
  >(async (req, res) => {
    const magnoliCustomerId =
      req.user?.customerId || req.user?.magnoliCustomerId;
    const result = await deliveryAppSettingsService.upsertByMagnoliCustomerId(
      magnoliCustomerId!,
      req.body
    );
    if (!result.success) {
      res
        .status(result.error!.statusCode)
        .json(
          error(
            result.error!.message,
            [result.error!.code],
            result.error!.details
          ) as unknown as ApiResponse<DeliveryAppSettings | null>
        );
      return;
    }
    res
      .status(200)
      .json(
        success(
          result.data as DeliveryAppSettings | null,
          "Delivery app settings updated successfully"
        )
      );
  });

  get = controllerHandler<unknown, ApiResponse<DeliveryAppSettings | null>>(
    async (req, res) => {
      const origin = req.headers["origin"] || req.headers["referer"] || "";
      let extractedUrl = "";

      if (origin) {
        extractedUrl = origin as string;
      } else {
        const host =
          req.headers["x-forwarded-host"] || req.headers["host"] || "";
        const protocol =
          req.headers["x-forwarded-proto"] || req.protocol || "http";
        if (host) {
          extractedUrl = `${protocol}://${host}`;
        }
      }

      if (!extractedUrl) {
        res
          .status(400)
          .json(
            error("Could not determine origin from request headers", [
              "BAD_REQUEST",
            ]) as unknown as ApiResponse<DeliveryAppSettings | null>
          );
        return;
      }

      const result = await deliveryAppSettingsService.getByDeliveryAppUrl(
        extractedUrl
      );
      if (!result.success) {
        res
          .status(result.error!.statusCode)
          .json(
            error(
              result.error!.message,
              [result.error!.code],
              result.error!.details
            ) as unknown as ApiResponse<DeliveryAppSettings | null>
          );
        return;
      }

      if (!result.data) {
        res
          .status(404)
          .json(
            error("Delivery app settings not found for the provided URL", [
              "NOT_FOUND",
            ]) as unknown as ApiResponse<DeliveryAppSettings | null>
          );
        return;
      }

      res
        .status(200)
        .json(
          success(
            result.data as DeliveryAppSettings,
            "Delivery app settings retrieved successfully"
          )
        );
    }
  );

  getByMagnoliCustomerId = authenticatedControllerHandler<
    void,
    ApiResponse<DeliveryAppSettings | null>
  >(async (req, res) => {
    const result = await deliveryAppSettingsService.getByMagnoliCustomerId(
      req.user?.magnoliCustomerId! || req.user?.customerId!
    );
    if (!result.success) {
      res
        .status(result.error!.statusCode)
        .json(
          error(
            result.error!.message,
            [result.error!.code],
            result.error!.details
          ) as unknown as ApiResponse<DeliveryAppSettings | null>
        );
      return;
    }
    res
      .status(200)
      .json(
        success(
          result.data as DeliveryAppSettings | null,
          "Delivery app settings retrieved successfully"
        )
      );
  });
}

const deliveryAppSettingsController = new DeliveryAppSettingsController();

export default deliveryAppSettingsController;
