import { Router } from "express";

import { generateRecipesHandler, getRecipeHandler } from "../controllers/recipe.controller.js";
import { generateRateLimiter } from "../middleware/rate-limit.js";
import { requireAuth } from "../middleware/require-auth.js";
import { validateBody } from "../middleware/validate-request.js";
import { generateRecipesRequestSchema } from "../validators/recipe.validators.js";

export const recipeRouter = Router();

recipeRouter.use(requireAuth);

recipeRouter.post(
  "/generate",
  generateRateLimiter,
  validateBody(generateRecipesRequestSchema),
  generateRecipesHandler,
);
recipeRouter.get("/:id", getRecipeHandler);
