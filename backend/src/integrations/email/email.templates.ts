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
    text: `Hello ${name}, a workshop matching your profile was published: ${title}. ${link}`,
    html: `<p>Hello ${name},</p><p><a href="${link}">${title}</a> matches your learning profile.</p>`,
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
