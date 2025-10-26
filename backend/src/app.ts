import express from "express";
import { configureRoutes } from "./config/routes.config";

const app = express();

configureRoutes(app);

export { app };
