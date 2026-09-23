import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as controller from "./order.controller";

export const orderRouter = Router();

orderRouter.use(requireAuth, requireVerified);

orderRouter.post(
  "/",
  validate(z.object({ body: z.object({ workshopId: z.string().uuid() }) })),
  controller.create,
);

orderRouter.get("/me", controller.getMine);

orderRouter.get(
  "/:id",
  validate(z.object({ params: z.object({ id: z.string().uuid() }) })),
  controller.getDetails,
);
