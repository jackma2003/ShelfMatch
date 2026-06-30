import { Router } from "express";

import {
  listSavedRecipesHandler,
  saveRecipeHandler,
  unsaveRecipeHandler,
  updateSavedRecipeHandler,
} from "../controllers/saved-recipe.controller.js";
import { requireAuth } from "../middleware/require-auth.js";
import { validateBody, validateQuery } from "../middleware/validate-request.js";
import {
  saveRecipeSchema,
  savedListQuerySchema,
  updateSavedRecipeSchema,
} from "../validators/saved-recipe.validators.js";

export const savedRecipeRouter = Router();

savedRecipeRouter.use(requireAuth);

savedRecipeRouter.get("/", validateQuery(savedListQuerySchema), listSavedRecipesHandler);
savedRecipeRouter.post("/", validateBody(saveRecipeSchema), saveRecipeHandler);
savedRecipeRouter.patch("/:id", validateBody(updateSavedRecipeSchema), updateSavedRecipeHandler);
savedRecipeRouter.delete("/:id", unsaveRecipeHandler);
