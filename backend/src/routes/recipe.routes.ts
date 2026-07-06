import { Router } from "express";

import { generateRecipesHandler, getRecipeHandler } from "../controllers/recipe.controller.js";
import { generateRateLimiter } from "../middleware/rate-limit.js";
import { requireAuth } from "../middleware/require-auth.js";

export const recipeRouter = Router();

recipeRouter.use(requireAuth);

recipeRouter.post("/generate", generateRateLimiter, generateRecipesHandler);
recipeRouter.get("/:id", getRecipeHandler);
