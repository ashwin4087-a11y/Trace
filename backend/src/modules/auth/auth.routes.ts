import { Router } from "express";
import { authRateLimit } from "../../middleware/rate-limit.middleware";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as controller from "./auth.controller";
import { forgotSchema, loginSchema, registerSchema, resetSchema, tokenSchema } from "./auth.validation";

export const authRouter = Router();

authRouter.post("/register", authRateLimit, validate(registerSchema), controller.register);
authRouter.post("/login", authRateLimit, validate(loginSchema), controller.login);
authRouter.post("/refresh", controller.refresh);
authRouter.post("/logout", controller.logout);
authRouter.post("/verify-email", authRateLimit, validate(tokenSchema), controller.verifyEmail);
authRouter.post("/forgot-password", authRateLimit, validate(forgotSchema), controller.forgotPassword);
authRouter.post("/reset-password", authRateLimit, validate(resetSchema), controller.resetPassword);
authRouter.get("/me", requireAuth, controller.me);
