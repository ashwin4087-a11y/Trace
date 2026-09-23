import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../../config/environment";
import type { RoleName } from "@prisma/client";

export function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export type AccessPayload = {
  sub: string;
  role: RoleName;
};

export function signAccessToken(payload: AccessPayload): string {
  const options: SignOptions = { expiresIn: env.jwtAccessTtl as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, env.jwtSecret);
  if (typeof decoded === "string" || !decoded.sub || !decoded.role) {
    throw new Error("Invalid access token");
  }
  return { sub: decoded.sub, role: decoded.role as RoleName };
}

export function refreshExpiry(): Date {
  const date = new Date();
  date.setDate(date.getDate() + env.jwtRefreshTtlDays);
  return date;
}
