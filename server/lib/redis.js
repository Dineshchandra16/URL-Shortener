import Redis from "ioredis";
import process from "node:process";

const redisUrl = process.env.REDIS_URL;
const fallbackDeduplication = new Map();

export const redis = redisUrl
  ? new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: (attempt) => Math.min(attempt * 200, 2000),
    })
  : null;

if (redis) {
  redis.on("error", (error) => {
    console.warn("Redis unavailable; using fallback behavior:", error.message);
  });
  redis.connect().catch(() => {});
}

export async function getCachedLink(slug) {
  if (!redis || redis.status !== "ready") return null;
  try {
    const value = await redis.get(`link:${slug}`);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export async function cacheLink(slug, link) {
  if (!redis || redis.status !== "ready") return;
  try {
    await redis.set(`link:${slug}`, JSON.stringify(link), "EX", 86400);
  } catch {
    // Cache failures must never prevent a redirect.
  }
}

export async function invalidateLink(slug) {
  if (!redis || redis.status !== "ready") return;
  try {
    await redis.del(`link:${slug}`);
  } catch {
    // The TTL bounds stale cache entries if Redis is temporarily unavailable.
  }
}

export async function claimClickDeduplication(urlId, ipHash) {
  const key = `click:dedup:${urlId}:${ipHash}`;
  if (redis && redis.status === "ready") {
    try {
      return (await redis.set(key, "1", "EX", 120, "NX")) === "OK";
    } catch {
      // Fall through to the process-local deduplication window.
    }
  }
  const now = Date.now();
  const expiresAt = fallbackDeduplication.get(key) || 0;
  if (expiresAt > now) return false;
  fallbackDeduplication.set(key, now + 120_000);
  if (fallbackDeduplication.size > 10_000) {
    for (const [entry, expiry] of fallbackDeduplication) {
      if (expiry <= now) fallbackDeduplication.delete(entry);
    }
  }
  return true;
}

export async function pingRedis() {
  if (!redis || redis.status !== "ready") return false;
  try {
    return (await redis.ping()) === "PONG";
  } catch {
    return false;
  }
}
