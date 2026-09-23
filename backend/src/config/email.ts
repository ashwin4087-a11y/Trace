import { env } from "./environment";

export function isEmailConfigured(): boolean {
  return Boolean(env.email.host && env.email.from);
}
