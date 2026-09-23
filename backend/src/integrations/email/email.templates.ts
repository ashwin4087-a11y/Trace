import { env } from "../../config/environment";

export function verificationEmail(name: string, token: string) {
  const link = `${env.frontendUrl}/verify-email?token=${token}`;
  return {
    subject: "Verify your AUREX LMS email",
    text: `Hello ${name}, verify your email: ${link}`,
    html: `<p>Hello ${name},</p><p><a href="${link}">Verify your email</a></p>`,
  };
}

export function resetEmail(name: string, token: string) {
  const link = `${env.frontendUrl}/reset-password?token=${token}`;
  return {
    subject: "Reset your AUREX LMS password",
    text: `Hello ${name}, reset your password: ${link}`,
    html: `<p>Hello ${name},</p><p><a href="${link}">Reset your password</a></p>`,
  };
}

export function workshopAlertEmail(name: string, title: string, workshopId: string) {
  const link = `${env.frontendUrl}/workshops/${workshopId}`;
  return {
    subject: `New workshop: ${title}`,
    text: `Hello ${name}, a workshop matching your profile was published: ${title}. Register here: ${link}`,
    html: `<p>Hello ${name},</p>
<p><strong>${title}</strong> matches your learning profile.</p>
<p><a href="${link}" style="display:inline-block;padding:10px 20px;background-color:#A57D61;color:white;text-decoration:none;border-radius:4px;">Click here to register</a></p>`,
  };
}

export function registrationEmail(name: string, title: string) {
  return {
    subject: `Registration confirmed: ${title}`,
    text: `Hello ${name}, you are registered for ${title}.`,
    html: `<p>Hello ${name},</p><p>You are registered for <strong>${title}</strong>.</p>`,
  };
}

export function certificateEmail(name: string, title: string, code: string) {
  const link = `${env.frontendUrl}/verify/${code}`;
  return {
    subject: `Certificate issued: ${title}`,
    text: `Hello ${name}, your certificate for ${title} is ready. Verify: ${link}`,
    html: `<p>Hello ${name},</p><p>Your certificate for <strong>${title}</strong> is ready.</p><p><a href="${link}">Verify ${code}</a></p>`,
  };
}

export function sessionReminderEmail(
  participantName: string,
  workshopTitle: string,
  sessionTitle: string,
  startTime: Date,
  meetingUrl?: string | null,
  venue?: string | null,
) {
  const formattedTime = startTime.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "short",
  });

  const locationLine = meetingUrl
    ? `Join online: ${meetingUrl}`
    : venue
      ? `Venue: ${venue}`
      : "Please check your dashboard for location details.";

  const htmlLocation = meetingUrl
    ? `<p><strong>Join online:</strong> <a href="${meetingUrl}">${meetingUrl}</a></p>`
    : venue
      ? `<p><strong>Venue:</strong> ${venue}</p>`
      : `<p>Please check your dashboard for location details.</p>`;

  return {
    subject: `Reminder: "${sessionTitle}" starts tomorrow — ${workshopTitle}`,
    text: [
      `Hello ${participantName},`,
      ``,
      `This is a reminder that your session is coming up tomorrow.`,
      ``,
      `Workshop: ${workshopTitle}`,
      `Session:  ${sessionTitle}`,
      `When:     ${formattedTime} (IST)`,
      locationLine,
      ``,
      `See you there!`,
      `— TRACE Academia`,
    ].join("\n"),
    html: `
<p>Hello ${participantName},</p>
<p>This is a friendly reminder that your upcoming session starts <strong>tomorrow</strong>.</p>
<table cellpadding="6" cellspacing="0" style="border-collapse:collapse;margin:12px 0">
  <tr><td style="color:#6B5448;padding-right:12px">Workshop</td><td><strong>${workshopTitle}</strong></td></tr>
  <tr><td style="color:#6B5448;padding-right:12px">Session</td><td><strong>${sessionTitle}</strong></td></tr>
  <tr><td style="color:#6B5448;padding-right:12px">When</td><td>${formattedTime} (IST)</td></tr>
</table>
${htmlLocation}
<p style="color:#6B5448;font-size:13px">— TRACE Academia</p>`,
  };
}
