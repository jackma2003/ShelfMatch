import { Router } from "express";

import {
  googleAuthHandler,
  googleCallbackHandler,
  loginHandler,
  logoutHandler,
  meHandler,
  resendVerificationHandler,
  signupHandler,
  verifyEmailHandler,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/require-auth.js";
import { validateBody } from "../middleware/validate-request.js";
import { loginSchema, resendVerificationSchema, signupSchema } from "../validators/auth.validators.js";

export const authRouter = Router();

authRouter.post("/signup", validateBody(signupSchema), signupHandler);
authRouter.post("/login", validateBody(loginSchema), loginHandler);
authRouter.post("/logout", logoutHandler);
authRouter.get("/me", requireAuth, meHandler);
authRouter.get("/verify-email", verifyEmailHandler);
authRouter.post("/resend-verification", validateBody(resendVerificationSchema), resendVerificationHandler);
authRouter.get("/google", googleAuthHandler);
authRouter.get("/google/callback", googleCallbackHandler);
