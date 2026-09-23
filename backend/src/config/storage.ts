import path from "node:path";
import { env, repoRoot } from "./environment";

export const localUploadDir = path.join(repoRoot, "public", "uploads");
export const localCertificateDir = path.join(repoRoot, "public", "certificates");

export function isObjectStorageConfigured(): boolean {
  return Boolean(env.storage.endpoint && env.storage.bucket && env.storage.accessKey);
}
