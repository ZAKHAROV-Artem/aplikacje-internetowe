import { success, fail } from "../../lib/http";
import deliveryAppSettingsService from "./delivery-app-settings.service";
import {
  authenticatedControllerHandler2,
  controllerHandler2,
} from "../../utils/controllerHandler2";
import { DeliveryAppSettings } from "magnoli-types";

class DeliveryAppSettingsController {
  upsertForMagnoliCustomer = authenticatedControllerHandler2<
    { body: DeliveryAppSettings },
    DeliveryAppSettings
  >(async (req, res) => {
    const magnoliCustomerId =
      req.user?.customerId || req.user?.magnoliCustomerId;
    const result = await deliveryAppSettingsService.upsertByMagnoliCustomerId(
      magnoliCustomerId!,
      req.body
    );
    if (!result.success) {
      fail(
        res,
        result.error!.statusCode,
        result.error!.code,
        result.error!.message,
        result.error!.details
      );
      return;
    }
    success(res, result.data);
  });

  get = controllerHandler2<unknown, DeliveryAppSettings>(async (req, res) => {
    const origin = req.headers["origin"] || req.headers["referer"] || "";
    let extractedUrl = "";

    if (origin) {
      extractedUrl = origin as string;
    } else {
      const host = req.headers["x-forwarded-host"] || req.headers["host"] || "";
      const protocol =
        req.headers["x-forwarded-proto"] || req.protocol || "http";
      if (host) {
        extractedUrl = `${protocol}://${host}`;
      }
    }

    if (!extractedUrl) {
      fail(
        res,
        400,
        "BAD_REQUEST",
        "Could not determine origin from request headers"
      );
      return;
    }

    const result = await deliveryAppSettingsService.getByDeliveryAppUrl(
      extractedUrl
    );
    if (!result.success) {
      fail(
        res,
        result.error!.statusCode,
        result.error!.code,
        result.error!.message,
        result.error!.details
      );
      return;
    }

    if (!result.data) {
      fail(
        res,
        404,
        "NOT_FOUND",
        "Delivery app settings not found for the provided URL"
      );
      return;
    }

    success(res, result.data);
  });

  getByMagnoliCustomerId = authenticatedControllerHandler2<
    void,
    DeliveryAppSettings
  >(async (req, res) => {
    const result = await deliveryAppSettingsService.getByMagnoliCustomerId(
      req.user?.magnoliCustomerId! || req.user?.customerId!
    );
    if (!result.success) {
      fail(
        res,
        result.error!.statusCode,
        result.error!.code,
        result.error!.message,
        result.error!.details
      );
      return;
    }
    success(res, result.data);
  });
}

const deliveryAppSettingsController = new DeliveryAppSettingsController();

export default deliveryAppSettingsController;
