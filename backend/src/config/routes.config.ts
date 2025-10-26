import express, { Application, Router } from "express";
import passport from "passport";
import logger from "morgan";

// Import middleware
import { cors } from "../middleware/cors";
import { captureAuthToken } from "../middleware/auth-token.middleware";

// Import routers
import { healthRouter } from "../modules/health/health.router";
import { pickupsRouter } from "../modules/pickups/pickups.router";
import { routesRouter } from "../modules/routes/routes.router";
import { authRouter } from "../modules/auth/auth.router";
import { customersRouter } from "../modules/customers/customers.router";
import { eventsRouter } from "../modules/events/events.router";
import { deliveryAppSettingsRouter } from "../modules/delivery-app-settings/delivery-app-settings.router";
import { usersRouter } from "../modules/users/users.router";
import { companiesRouter } from "../modules/companies/companies.router";

// Import JWT strategy
import "../modules/auth/jwt.strategy";

// Import HTTP utilities
import { fail } from "../lib/http";
import { errorHandler } from "../middleware/error.middleware";
import { generalLimiter } from "../middleware/rate-limit.middleware";

export const configureRoutes = (app: Application) => {
  const router = Router();
  const apiVersion = process.env.API_VERSION || "v1";

  // Enable CORS for all routes
  app.use(cors);

  // Parse JSON bodies
  app.use(express.json());

  // Initialize Passport
  app.use(passport.initialize());

  // Logging middleware
  const formatsLogger = app.get("env") === "development" ? "dev" : "short";
  app.use(logger(formatsLogger));

  // Custom middleware
  app.use(captureAuthToken);

  // Apply general rate limiting to all routes
  app.use(generalLimiter);

  // API routes
  router.use("/health", healthRouter);
  router.use("/auth", authRouter);
  router.use("/users", usersRouter);
  router.use("/companies", companiesRouter);
  router.use("/customers", customersRouter);
  router.use("/pickups", pickupsRouter);
  router.use("/routes", routesRouter);
  router.use("/events", eventsRouter);
  router.use("/delivery-app-settings", deliveryAppSettingsRouter);

  // API version endpoint
  router.get("/version", (_req, res) => {
    res.json({
      apiVersion: process.env.API_VERSION || "v1",
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION || "1.0.0",
    });
  });

  // Mount API routes
  app.use(`/api/${apiVersion}`, router);

  // Fallback 404 handler
  app.use((req, res) => {
    fail(res, 404, "NOT_FOUND", "Route not found", { path: req.path });
  });

  // Global error handler
  app.use(errorHandler);
};
