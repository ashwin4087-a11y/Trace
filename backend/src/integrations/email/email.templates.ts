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

export function workshopPublishedEmail(name: string, title: string, workshopId: string) {
  const workshopUrl = `${env.frontendUrl}/workshops/${workshopId}`;
  return {
    subject: `New Workshop Available — ${title}`,
    text: [
      "TRACE Academia",
      "",
      "A new learning experience is now open.",
      "",
      title,
      "",
      "A new workshop has been published on TRACE Academia and registration is now open.",
      "Explore the workshop details, schedule, learning outcomes, and registration information:",
      workshopUrl,
      "",
      "You may be asked to sign in to your TRACE account before continuing.",
      "",
      "TRACE Academia",
      "Every learning experience leaves a trace.",
      "This is an automated notification from TRACE Academia.",
    ].join("\n"),
    html: `
<div style="margin:0;background:#fff4e8;padding:32px 16px;font-family:Arial,sans-serif;color:#1a1412">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #dfc1b0;border-radius:12px;overflow:hidden">
    <div style="background:#1a1412;padding:24px 32px;color:#ffeddb;font-size:20px;font-weight:bold;letter-spacing:.04em">TRACE <span style="color:#bf9270;font-size:12px">ACADEMIA</span></div>
    <div style="padding:32px">
      <p style="margin:0 0 12px;color:#bf9270;font-size:12px;font-weight:bold;letter-spacing:.12em;text-transform:uppercase">A new learning experience is now open.</p>
      <h1 style="margin:0 0 18px;font-size:28px;line-height:1.2;font-weight:normal">${title}</h1>
      <p>Hello ${name},</p>
      <p style="color:#5f524b;line-height:1.6">A new workshop has been published on TRACE Academia and registration is now open.</p>
      <p style="color:#5f524b;line-height:1.6">Explore the workshop details, schedule, learning outcomes, and registration information through the TRACE portal.</p>
      <p style="margin:28px 0;text-align:center"><a href="${workshopUrl}" style="display:inline-block;background:#bf9270;color:#ffffff;padding:14px 24px;border-radius:7px;text-decoration:none;font-weight:bold">VIEW WORKSHOP &rarr;</a></p>
      <p style="color:#6b5448;font-size:13px;font-style:italic">You may be asked to sign in to your TRACE account before continuing.</p>
    </div>
    <div style="border-top:1px solid #dfc1b0;padding:20px 32px;color:#6b5448;font-size:12px;line-height:1.6">
      <strong>TRACE Academia</strong><br><em>Every learning experience leaves a trace.</em><br><br>This is an automated notification from TRACE Academia.
    </div>
  </div>
</div>`,
  };
}

export function workshopDigestEmail(
  name: string,
  recommendations: Array<{ title: string; score: number; workshopId: string }>,
) {
  const count = recommendations.length;
  const portalUrl = `${env.frontendUrl}/workshops?recommended=true`;
  const links = recommendations.map((item) => `${item.title} (${item.score}% match): ${env.frontendUrl}/workshops/${item.workshopId}`);
  return {
    subject: `${count} workshops matched to your interests | TRACE Academia`,
    text: [
      "TRACE Academia",
      "",
      `Hello ${name},`,
      "",
      `We found ${count} workshops currently open for registration that match your interests and profile.`,
      "",
      "RECOMMENDED FOR YOU",
      ...links,
      "",
      `VIEW ALL ${count} WORKSHOPS: ${portalUrl}`,
      "",
      "TRACE Academia",
      "Every learning experience leaves a trace.",
    ].join("\n"),
    html: `<div style="margin:0;background:#fff4e8;padding:32px 16px;font-family:Arial,sans-serif;color:#1a1412"><div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #dfc1b0;border-radius:12px;overflow:hidden"><div style="background:#1a1412;padding:24px 32px;color:#ffeddb;font-size:20px;font-weight:bold">TRACE <span style="color:#bf9270;font-size:12px">ACADEMIA</span></div><div style="padding:32px"><p>Hello ${name},</p><h1 style="font-size:26px;font-weight:normal">${count} workshops matched to your interests</h1><p style="color:#5f524b;line-height:1.6">We found workshops currently open for registration that match your interests and profile.</p><h2 style="font-size:13px;letter-spacing:.12em;color:#bf9270">RECOMMENDED FOR YOU</h2>${recommendations.map((item) => `<p style="border-top:1px solid #dfc1b0;padding-top:14px"><strong>${item.title}</strong><br><span style="color:#8b5e3c">${item.score}% match</span><br><a href="${env.frontendUrl}/workshops/${item.workshopId}" style="color:#8b5e3c">View &amp; Register &rarr;</a></p>`).join("")}<p style="margin:28px 0;text-align:center"><a href="${portalUrl}" style="display:inline-block;background:#bf9270;color:#fff;padding:14px 24px;border-radius:7px;text-decoration:none;font-weight:bold">VIEW ALL ${count} WORKSHOPS &rarr;</a></p></div><div style="border-top:1px solid #dfc1b0;padding:20px 32px;color:#6b5448;font-size:12px"><strong>TRACE Academia</strong><br><em>Every learning experience leaves a trace.</em></div></div></div>`,
  };
}

export function registrationEmail(name: string, title: string, workshopId: string) {
  const workshopUrl = `${env.frontendUrl}/workshops/${workshopId}`;
  return {
    subject: `Registration Confirmed — ${title}`,
    text: [
      "TRACE Academia",
      "",
      "You're officially registered.",
      "",
      `Hello ${name},`,
      "",
      `Your registration for ${title} has been successfully confirmed.`,
      "Your place in the workshop is reserved. You can access the complete workshop portal for the schedule, sessions, learning materials, announcements, and other workshop information.",
      "",
      `VIEW WORKSHOP PORTAL → ${workshopUrl}`,
      "",
      "You may be asked to sign in to your TRACE account before continuing. After signing in, you'll be taken directly to your workshop.",
      "",
      `Workshop: ${title}`,
      "Registration status: Confirmed",
      "",
      "TRACE Academia",
      "Every learning experience leaves a trace.",
      "This is an automated notification from TRACE Academia.",
    ].join("\n"),
    html: `
<div style="margin:0;background:#fff4e8;padding:32px 16px;font-family:Arial,sans-serif;color:#1a1412">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #dfc1b0;border-radius:12px;overflow:hidden">
    <div style="background:#1a1412;padding:24px 32px;color:#ffeddb;font-size:20px;font-weight:bold;letter-spacing:.04em">TRACE <span style="color:#bf9270;font-size:12px">ACADEMIA</span></div>
    <div style="padding:32px">
      <p style="margin:0 0 12px;color:#bf9270;font-size:12px;font-weight:bold;letter-spacing:.12em;text-transform:uppercase">You're officially registered.</p>
      <h1 style="margin:0 0 18px;font-size:28px;line-height:1.2;font-weight:normal">Welcome to your workshop journey.</h1>
      <p>Hello ${name},</p>
      <p style="color:#5f524b;line-height:1.6">Your registration for <strong>${title}</strong> has been successfully confirmed.</p>
      <p style="color:#5f524b;line-height:1.6">Your place in the workshop is reserved. Access the complete workshop portal for the schedule, sessions, learning materials, announcements, and other workshop information.</p>
      <p style="margin:28px 0;text-align:center"><a href="${workshopUrl}" style="display:inline-block;background:#bf9270;color:#ffffff;padding:14px 24px;border-radius:7px;text-decoration:none;font-weight:bold">VIEW WORKSHOP PORTAL &rarr;</a></p>
      <p style="color:#6b5448;font-size:13px;font-style:italic">You may be asked to sign in to your TRACE account before continuing. After signing in, you'll be taken directly to your workshop.</p>
      <div style="margin-top:24px;padding:16px;background:#fff4e8;border:1px solid #dfc1b0;border-radius:8px;line-height:1.7">
        <strong>Workshop</strong><br>${title}<br><br><strong>Registration status</strong><br><span style="color:#8b5e3c">✓ Confirmed</span>
      </div>
    </div>
    <div style="border-top:1px solid #dfc1b0;padding:20px 32px;color:#6b5448;font-size:12px;line-height:1.6">
      <strong>TRACE Academia</strong><br><em>Every learning experience leaves a trace.</em><br><br>This is an automated notification from TRACE Academia.
    </div>
  </div>
</div>`,
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
