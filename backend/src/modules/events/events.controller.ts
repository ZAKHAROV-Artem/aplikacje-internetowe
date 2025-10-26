import { successPresets } from "../../lib/http";
import eventsService from "./events.service";
import { authenticatedControllerHandler2 } from "../../utils/controllerHandler2";
import { EventCreateInput } from "magnoli-types";

class EventsController {
  create = authenticatedControllerHandler2<
    { body: EventCreateInput },
    { recorded: boolean; id: string }
  >(async (req, res) => {
    const result = await eventsService.createFromClient(
      req.body,
      req.user.sub,
      req.user?.magnoliCustomerId
    );
    successPresets.created(res, result);
  });
}

const eventsController = new EventsController();

export default eventsController;
