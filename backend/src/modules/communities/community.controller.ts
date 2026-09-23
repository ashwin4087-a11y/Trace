import { asyncHandler } from "../../shared/utils/async-handler";
import * as communities from "./community.service";

export const list = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await communities.listCommunities(req.user!.id) });
});

export const join = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await communities.join(req.user!.id, req.params.id) });
});

export const posts = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await communities.listPosts(req.params.id) });
});

export const createPost = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await communities.createPost(req.user!, req.body) });
});

export const moderate = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await communities.moderate(req.user!, req.params.postId, req.body.hidden) });
});

export const vote = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await communities.vote(req.user!.id, req.params.pollId, req.body.optionIndex) });
});
