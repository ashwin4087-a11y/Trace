import fs from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";
import { env } from "../../config/environment";
import { isEmailConfigured } from "../../config/email";
import type { EmailMessage } from "./email.types";

const outboxDir = path.resolve(__dirname, "../../../../public/uploads");

export async function sendEmail(message: EmailMessage): Promise<{ delivered: boolean; mode: "smtp" | "log" }> {
  if (!isEmailConfigured()) {
    fs.mkdirSync(outboxDir, { recursive: true });
    const file = path.join(outboxDir, `mail-${Date.now()}.json`);
    fs.writeFileSync(
      file,
      JSON.stringify({ ...message, loggedAt: new Date().toISOString() }, null, 2),
    );
    console.info(`[email:log] To ${message.to} | ${message.subject}`);
    return { delivered: false, mode: "log" };
  }

  const transport = nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: env.email.port === 465,
    auth: env.email.user ? { user: env.email.user, pass: env.email.password } : undefined,
  });

  try {
    await transport.sendMail({
      from: env.email.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
    return { delivered: true, mode: "smtp" };
  } catch (error) {
    if (env.isProd) {
      throw error;
    }
    fs.mkdirSync(outboxDir, { recursive: true });
    const file = path.join(outboxDir, `mail-${Date.now()}.json`);
    fs.writeFileSync(
      file,
      JSON.stringify({ ...message, loggedAt: new Date().toISOString() }, null, 2),
    );
    console.warn(`[email:log] SMTP delivery failed; wrote ${file}`);
    return { delivered: false, mode: "log" };
  }
}
