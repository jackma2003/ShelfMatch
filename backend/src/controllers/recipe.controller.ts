import type { Request, Response } from "express";

import * as recipeService from "../services/recipe-generation.service.js";

export async function generateRecipesHandler(req: Request, res: Response) {
  const recipes = await recipeService.generateRecipes(req.userId!);
  res.status(201).json({ recipes });
}

export async function getRecipeHandler(req: Request, res: Response) {
  const recipe = await recipeService.getRecipeById(req.userId!, String(req.params.id));
  res.status(200).json({ recipe });
}
