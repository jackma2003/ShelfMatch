import { Router } from "express";

import {
  createPantryItemHandler,
  deletePantryItemHandler,
  listPantryItemsHandler,
  updatePantryItemHandler,
} from "../controllers/pantry.controller.js";
import { requireAuth } from "../middleware/require-auth.js";
import { validateBody, validateQuery } from "../middleware/validate-request.js";
import {
  createPantryItemSchema,
  pantryListQuerySchema,
  updatePantryItemSchema,
} from "../validators/pantry.validators.js";

export const pantryRouter = Router();

pantryRouter.use(requireAuth);

pantryRouter.get("/", validateQuery(pantryListQuerySchema), listPantryItemsHandler);
pantryRouter.post("/", validateBody(createPantryItemSchema), createPantryItemHandler);
pantryRouter.patch("/:id", validateBody(updatePantryItemSchema), updatePantryItemHandler);
pantryRouter.delete("/:id", deletePantryItemHandler);
