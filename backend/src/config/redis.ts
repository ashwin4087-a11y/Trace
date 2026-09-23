import { env } from "./environment";

/**
 * Redis is optional. Core LMS routes do not require it.
 * Background jobs fall back to inline execution when REDIS_URL is empty
 * or the connection cannot be opened.
 */
export function isRedisConfigured(): boolean {
  return Boolean(env.redisUrl);
}

export async function checkRedis(): Promise<"disabled" | "up" | "down"> {
  if (!env.redisUrl) return "disabled";
  try {
    const { default: Redis } = await import("ioredis");
    const client = new Redis(env.redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 1500,
      lazyConnect: true,
    });
    await client.connect();
    const pong = await client.ping();
    await client.quit();
    return pong === "PONG" ? "up" : "down";
  } catch {
    return "down";
  }
}
