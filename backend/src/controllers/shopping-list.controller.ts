import type { Request, Response } from "express";

import * as shoppingListService from "../services/shopping-list.service.js";

export async function listShoppingListItemsHandler(req: Request, res: Response) {
  const items = await shoppingListService.listShoppingListItems(req.userId!);
  res.status(200).json({ items });
}

export async function addShoppingListItemHandler(req: Request, res: Response) {
  const items = await shoppingListService.addShoppingListItem(req.userId!, req.body);
  res.status(201).json({ items });
}

export async function updateShoppingListItemHandler(req: Request, res: Response) {
  const item = await shoppingListService.updateShoppingListItem(
    req.userId!,
    String(req.params.id),
    req.body,
  );
  res.status(200).json({ item });
}

export async function deleteShoppingListItemHandler(req: Request, res: Response) {
  await shoppingListService.deleteShoppingListItem(req.userId!, String(req.params.id));
  res.status(200).json({ success: true });
}
