import { Router } from "express";

import { generateRecipesHandler, getRecipeHandler } from "../controllers/recipe.controller.js";
import { requireAuth } from "../middleware/require-auth.js";

export const recipeRouter = Router();

recipeRouter.use(requireAuth);

recipeRouter.post("/generate", generateRecipesHandler);
recipeRouter.get("/:id", getRecipeHandler);
