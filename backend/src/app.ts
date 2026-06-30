import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { errorHandler } from "./middleware/error-handler.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use(errorHandler);

  return app;
}
