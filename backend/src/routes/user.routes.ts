import { Router } from "express";

import {
  changePasswordHandler,
  deleteAccountHandler,
  updateProfileHandler,
} from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/require-auth.js";
import { validateBody } from "../middleware/validate-request.js";
import { changePasswordSchema, updateProfileSchema } from "../validators/user.validators.js";

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.patch("/me", validateBody(updateProfileSchema), updateProfileHandler);
userRouter.patch("/me/password", validateBody(changePasswordSchema), changePasswordHandler);
userRouter.delete("/me", deleteAccountHandler);
