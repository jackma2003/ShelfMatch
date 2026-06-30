import type { Request, Response } from "express";

import * as pantryService from "../services/pantry.service.js";
import type { PantryListQuery } from "../validators/pantry.validators.js";

export async function listPantryItemsHandler(req: Request, res: Response) {
  const query = req.validatedQuery as PantryListQuery;
  const items = await pantryService.listPantryItems(req.userId!, query);
  res.status(200).json({ items });
}

export async function createPantryItemHandler(req: Request, res: Response) {
  const item = await pantryService.createPantryItem(req.userId!, req.body);
  res.status(201).json({ item });
}

export async function updatePantryItemHandler(req: Request, res: Response) {
  const item = await pantryService.updatePantryItem(req.userId!, String(req.params.id), req.body);
  res.status(200).json({ item });
}

export async function deletePantryItemHandler(req: Request, res: Response) {
  await pantryService.deletePantryItem(req.userId!, String(req.params.id));
  res.status(200).json({ success: true });
}
