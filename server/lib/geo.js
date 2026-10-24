import geoip from "geoip-lite";
import { UAParser } from "ua-parser-js";

const parser = new UAParser();

export function parseVisitor(req) {
  // Extract client IP address (supporting proxies, Cloudflare, load balancers)
  const forwarded = req.headers["x-forwarded-for"];
  const rawIp = forwarded
    ? forwarded.split(",")[0].trim()
    : req.socket?.remoteAddress || req.ip || "";
  // Normalize IPv6 mapped IPv4 addresses (e.g., ::ffff:127.0.0.1)
  const ip = rawIp.replace(/^.*:/, "");

  // Offline in-memory GeoIP lookup (0ms network delay, not blocked by ad-blockers)
  let city = "Unknown";
  let country = "Unknown";

  if (ip && ip !== "127.0.0.1" && ip !== "localhost") {
    const geo = geoip.lookup(ip);
    if (geo) {
      city = geo.city || "Unknown";
      country = geo.country || "Unknown";
    }
  }

  // Parse visitor device category from User-Agent
  const userAgent = req.headers["user-agent"] || "";
  parser.setUA(userAgent);
  const parsed = parser.getResult();
  const device = parsed.device?.type || "desktop";

  return { ip, city, country, device };
}
