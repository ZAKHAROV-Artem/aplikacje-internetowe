import analyticsService from "../analytics/analytics.service";
import { ExternalServiceError } from "../../lib/http";
import { EventCreateInput } from "magnoli-types";

class EventsService {
  async createFromClient(
    body: EventCreateInput,
    customerId?: string,
    magnoliCustomerId?: string
  ) {
    const { type, payload } = body || {};

    const resolvedCustomerId = customerId;

    const result = await analyticsService.record(type, {
      customerId: resolvedCustomerId || undefined,
      magnoliCustomerId: magnoliCustomerId,
      payload: payload || {},
    });

    if (!result.success) {
      throw new ExternalServiceError("Analytics", result.error!.message);
    }

    return { recorded: true, id: result.data!.id };
  }
}

const eventsService = new EventsService();

export default eventsService;
