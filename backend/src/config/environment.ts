import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

const nodeEnv = process.env.NODE_ENV ?? "development";
const isProd = nodeEnv === "production";

export const env = {
  nodeEnv,
  isProd,
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: required("JWT_SECRET", isProd ? undefined : "dev-only-access-secret-change-me"),
  jwtRefreshSecret: required(
    "JWT_REFRESH_SECRET",
    isProd ? undefined : "dev-only-refresh-secret-change-me",
  ),
  jwtAccessTtl: process.env.JWT_ACCESS_TTL ?? "15m",
  jwtRefreshTtlDays: Number(process.env.JWT_REFRESH_TTL_DAYS ?? 7),
  redisUrl: process.env.REDIS_URL || "",
  attendance: {
    enabled: process.env.ATTENDANCE_ENABLED === "true",
    autoIssue: process.env.ATTENDANCE_AUTO_ISSUE === "true",
    tokenRetentionDays: Number(process.env.ATTENDANCE_TOKEN_RETENTION_DAYS ?? 30),
    eventRetentionDays: Number(process.env.ATTENDANCE_EVENT_RETENTION_DAYS ?? 180),
  },
  email: {
    host: process.env.EMAIL_HOST || "",
    port: Number(process.env.EMAIL_PORT ?? 587),
    user: process.env.EMAIL_USER || "",
    password: process.env.EMAIL_PASSWORD || "",
    from: process.env.EMAIL_FROM || "noreply@aurex.local",
  },
  storage: {
    endpoint: process.env.STORAGE_ENDPOINT || "",
    bucket: process.env.STORAGE_BUCKET || "",
    accessKey: process.env.STORAGE_ACCESS_KEY || "",
    secretKey: process.env.STORAGE_SECRET_KEY || "",
  },
  payment: {
    provider: process.env.PAYMENT_PROVIDER || "dev",
    key: process.env.PAYMENT_PROVIDER_KEY || "",
    secret: process.env.PAYMENT_PROVIDER_SECRET || "",
  },
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  backendUrl: process.env.BACKEND_URL || "http://localhost:4000",
};

export const repoRoot = path.resolve(__dirname, "../../..");
