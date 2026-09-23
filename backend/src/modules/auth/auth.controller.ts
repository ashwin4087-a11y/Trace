import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/async-handler";
import * as auth from "./auth.service";

export const register = asyncHandler(async (req, res) => {
  const user = await auth.register(req.body);
  res.status(201).json({ success: true, data: user });
});

export const login = asyncHandler(async (req, res) => {
  const result = await auth.login(req.body.email, req.body.password, res);
  res.json({ success: true, data: result });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const result = await auth.refresh(auth.readRefreshCookie(req), res);
  res.json({ success: true, data: result });
});

export const logout = asyncHandler(async (req, res) => {
  await auth.logout(auth.readRefreshCookie(req), req.user?.id, res);
  res.json({ success: true, data: { loggedOut: true } });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  await auth.verifyEmail(req.query.token as string);
  res.json({ success: true, data: { verified: true } });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await auth.forgotPassword(req.body.email);
  res.json({
    success: true,
    data: { accepted: true },
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await auth.resetPassword(req.body.token, req.body.password);
  res.json({ success: true, data: { reset: true } });
});

export const me = asyncHandler(async (req, res) => {
  const user = await auth.currentUser(req.user!.id);
  res.json({ success: true, data: user });
});
