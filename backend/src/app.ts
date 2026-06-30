import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { errorHandler } from "./middleware/error-handler.js";
import { authRouter } from "./routes/auth.routes.js";
import { pantryRouter } from "./routes/pantry.routes.js";
import { recipeRouter } from "./routes/recipe.routes.js";
import { savedRecipeRouter } from "./routes/saved-recipe.routes.js";
import { shoppingListRouter } from "./routes/shopping-list.routes.js";

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

  app.use("/api/auth", authRouter);
  app.use("/api/pantry", pantryRouter);
  app.use("/api/recipes", recipeRouter);
  app.use("/api/saved", savedRecipeRouter);
  app.use("/api/shopping-list", shoppingListRouter);

  app.use(errorHandler);

  return app;
}
