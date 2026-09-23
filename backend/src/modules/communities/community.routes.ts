import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { requireRoles } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as comments from "./comment.controller";
import * as controller from "./community.controller";

export const communityRouter = Router();

communityRouter.use(requireAuth, requireVerified);
communityRouter.get("/", controller.list);
communityRouter.post("/:id/join", controller.join);
communityRouter.get("/:id/posts", controller.posts);
communityRouter.post(
  "/posts",
  validate(
    z.object({
      body: z.object({
        communityId: z.string().uuid(),
        type: z.enum(["DISCUSSION", "QUESTION", "POLL", "RESOURCE"]),
        title: z.string().min(2),
        body: z.string().min(1),
        pollOptions: z.array(z.string()).optional(),
      }),
    }),
  ),
  controller.createPost,
);
communityRouter.post(
  "/posts/:postId/comments",
  validate(z.object({ body: z.object({ body: z.string().min(1) }) })),
  comments.create,
);
communityRouter.post(
  "/posts/:postId/moderate",
  requireRoles("ORGANIZER", "ADMIN"),
  validate(z.object({ body: z.object({ hidden: z.boolean() }) })),
  controller.moderate,
);
communityRouter.post(
  "/polls/:pollId/votes",
  validate(z.object({ body: z.object({ optionIndex: z.number().int().min(0) }) })),
  controller.vote,
);
