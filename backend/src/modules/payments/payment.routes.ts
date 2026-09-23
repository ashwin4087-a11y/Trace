import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as controller from "./payment.controller";

export const paymentRouter = Router();

paymentRouter.use(requireAuth, requireVerified);
paymentRouter.get("/:orderId", controller.get);
paymentRouter.post(
  "/:orderId/verify",
  validate(z.object({ body: z.object({ providerReference: z.string().min(3) }) })),
  controller.verify,
);
