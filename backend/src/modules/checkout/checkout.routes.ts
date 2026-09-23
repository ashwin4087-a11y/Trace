import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as controller from "./checkout.controller";

export const checkoutRouter = Router();

checkoutRouter.use(requireAuth, requireVerified);
checkoutRouter.post(
  "/",
  validate(z.object({ body: z.object({ registrationId: z.string().uuid() }) })),
  controller.create,
);
