import { RateLimiterMemory, RateLimiterRedis } from "rate-limiter-flexible";
import { redis } from "../lib/redis.js";

const fallbackLimiters = new Map();

function getFallbackLimiter(name, points, duration) {
  const key = `${name}:${points}:${duration}`;
  if (!fallbackLimiters.has(key)) {
    fallbackLimiters.set(key, new RateLimiterMemory({ points, duration }));
  }
  return fallbackLimiters.get(key);
}

export function createRateLimiter({ name, points, duration }) {
  const fallback = getFallbackLimiter(name, points, duration);
  const distributed = redis
    ? new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: `rate:${name}`,
        points,
        duration,
        insuranceLimiter: fallback,
        execEvenly: false,
      })
    : fallback;

  return async (req, res, next) => {
    try {
      const result = await distributed.consume(req.ip || req.socket.remoteAddress || "unknown");
      res.set("RateLimit-Limit", String(points));
      res.set("RateLimit-Remaining", String(result.remainingPoints));
      next();
    } catch (error) {
      let limiterError = error;
      if (error instanceof Error && error.msBeforeNext === undefined) {
        // Redis may be unavailable even though its client has not emitted a ready state yet.
        try {
          await fallback.consume(req.ip || req.socket.remoteAddress || "unknown");
          next();
          return;
        } catch (fallbackError) {
          limiterError = fallbackError;
        }
      }
      const retryAfter = Math.max(1, Math.ceil((limiterError.msBeforeNext || 60000) / 1000));
      res.set("Retry-After", String(retryAfter));
      res.status(429).json({ error: "Too many requests. Please try again later." });
    }
  };
}

export const redirectRateLimit = createRateLimiter({
  name: "redirect",
  points: 120,
  duration: 60,
});

export const createUrlRateLimit = createRateLimiter({
  name: "create-url",
  points: 20,
  duration: 3600,
});
