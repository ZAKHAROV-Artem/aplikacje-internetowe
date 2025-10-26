import { Router } from "express";
import validate from "express-zod-safe";
import eventsController from "./events.controller";
import { requireAuth } from "../auth/shared/require-auth";
import { eventCreateInputSchema } from "magnoli-types";

const eventsRouter = Router();

eventsRouter.post(
  "/",
  requireAuth,
  validate({ body: eventCreateInputSchema }),
  eventsController.create
);

export { eventsRouter };
