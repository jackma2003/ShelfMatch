import type { Request, Response } from "express";

import * as recipeService from "../services/recipe-generation.service.js";
import type { GenerateRecipesInput } from "../validators/recipe.validators.js";

export async function generateRecipesHandler(req: Request, res: Response) {
  const filters = req.body as GenerateRecipesInput;
  // Cheap but valuable: ties a specific user's request to the exact filters the backend
  // received, so a "my filters didn't work" report can be checked against what the server
  // actually saw rather than re-derived from scratch.
  console.log(`[recipe-generation] generate request — userId=${req.userId} filters=${JSON.stringify(filters)}`);
  const recipes = await recipeService.generateRecipes(req.userId!, filters);
  res.status(201).json({ recipes });
}

export async function getRecipeHandler(req: Request, res: Response) {
  const recipe = await recipeService.getRecipeById(req.userId!, String(req.params.id));
  res.status(200).json({ recipe });
}
