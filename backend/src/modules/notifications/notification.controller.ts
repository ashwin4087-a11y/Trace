import { sendEmail } from "../../integrations/email/email.provider";
import { asyncHandler } from "../../shared/utils/async-handler";
import * as notifications from "./notification.service";

export const list = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await notifications.listMine(req.user!.id) });
});

export const read = asyncHandler(async (req, res) => {
  await notifications.markRead(req.user!.id, req.params.id);
  res.json({ success: true, data: { read: true } });
});

export const readAll = asyncHandler(async (req, res) => {
  await notifications.markAllRead(req.user!.id);
  res.json({ success: true, data: { read: true } });
});

export const preferences = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await notifications.getPreferences(req.user!.id) });
});

export const updatePreferences = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await notifications.updatePreferences(req.user!.id, req.body) });
});

export const testEmail = asyncHandler(async (req, res) => {
  const { to, subject, text, html } = req.body;
  const result = await sendEmail({
    to: to || req.user!.email,
    subject: subject || "Test Email from TRACE",
    text: text || "This is a test email sent from the TRACE backend.",
    html: html
  });
  res.json({ success: true, data: result });
});