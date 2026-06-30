import { Router } from "express";

import {
  addShoppingListItemHandler,
  deleteShoppingListItemHandler,
  listShoppingListItemsHandler,
  updateShoppingListItemHandler,
} from "../controllers/shopping-list.controller.js";
import { requireAuth } from "../middleware/require-auth.js";
import { validateBody } from "../middleware/validate-request.js";
import {
  addShoppingListItemSchema,
  updateShoppingListItemSchema,
} from "../validators/shopping-list.validators.js";

export const shoppingListRouter = Router();

shoppingListRouter.use(requireAuth);

shoppingListRouter.get("/", listShoppingListItemsHandler);
shoppingListRouter.post("/", validateBody(addShoppingListItemSchema), addShoppingListItemHandler);
shoppingListRouter.patch("/:id", validateBody(updateShoppingListItemSchema), updateShoppingListItemHandler);
shoppingListRouter.delete("/:id", deleteShoppingListItemHandler);
