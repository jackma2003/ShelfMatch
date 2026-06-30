import type { Request, Response } from "express";

import * as savedRecipeService from "../services/saved-recipe.service.js";
import type { SavedListQuery } from "../validators/saved-recipe.validators.js";

export async function listSavedRecipesHandler(req: Request, res: Response) {
  const query = req.validatedQuery as SavedListQuery;
  const savedRecipes = await savedRecipeService.listSavedRecipes(req.userId!, query);
  res.status(200).json({ savedRecipes });
}

export async function saveRecipeHandler(req: Request, res: Response) {
  const saved = await savedRecipeService.saveRecipe(req.userId!, req.body);
  res.status(201).json({ savedRecipe: saved });
}

export async function updateSavedRecipeHandler(req: Request, res: Response) {
  const saved = await savedRecipeService.updateSavedRecipeStatus(
    req.userId!,
    String(req.params.id),
    req.body,
  );
  res.status(200).json({ savedRecipe: saved });
}

export async function unsaveRecipeHandler(req: Request, res: Response) {
  await savedRecipeService.unsaveRecipe(req.userId!, String(req.params.id));
  res.status(200).json({ success: true });
}
