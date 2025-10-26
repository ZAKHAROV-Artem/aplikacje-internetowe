import express from "express";
import { Request, Response } from "express";

import { success } from "../../lib/http";
const router = express.Router();

// Basic health check
router.get("/", (_req: Request, res: Response) =>
  success(res, {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.APP_VERSION || "1.0.0",
  })
);

export { router as healthRouter };
