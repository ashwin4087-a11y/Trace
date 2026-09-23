import { Router } from "express";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import * as controller from "./recommendation.controller";

export const recommendationRouter = Router();

recommendationRouter.get("/me", requireAuth, requireVerified, controller.mine);
