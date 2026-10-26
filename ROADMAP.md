# 🗺️ Trimrr — Production Architecture Roadmap & Progress

This document tracks the phased production-readiness roadmap for Trimrr. Any AI agent or developer can read this file to understand the current state of the application and immediately continue with the next phase.

---

## 📌 Overall Project Architecture

Trimrr is a full-stack URL Shortener & Analytics platform:
- **Frontend**: React 18, Vite, Tailwind CSS, shadcn/ui, Radix UI primitives.
- **Backend**: Node.js, Express, `geoip-lite` (in-memory offline GeoIP), `ua-parser-js`.
- **Database & Auth**: Supabase PostgreSQL (with Row Level Security and B-Tree indexes) and Supabase Auth (JWT).
- **Storage**: Supabase Storage buckets (`profile_pic`, `qrs`).

---

## ✅ Phase 1: Security, Integrity & Client-Side Corrections (COMPLETED)
*Git Commit: `ca6bb86`*

- [x] **Database Row Level Security (RLS)**: Enabled RLS on `public.urls` and `public.clicks`. Public read access for redirects, user-isolated writes for links and analytics.
- [x] **Database Performance Indexes**:
  - `idx_urls_user_id`: B-tree index on `urls(user_id)` for instantaneous dashboard link loading.
  - `idx_clicks_url_id`: B-tree index on `clicks(url_id)` for fast click lookups.
  - `idx_clicks_url_id_created_at`: Composite index on `clicks(url_id, created_at DESC)`.
  - Migration script saved at: `supabase/migrations/20261020_init_indexes.sql`.
- [x] **QR Code Target Bug Fixed**: Updated `src/components/create-link.jsx` so the QR canvas encodes the full short link (`${origin}/${slug}`) instead of the destination URL. Scanning QR codes now accurately records analytics.
- [x] **Reserved Slug Blacklist**: Blocked system routes (`auth`, `dashboard`, `link`, `api`, `admin`, `settings`, etc.) from being claimed as custom aliases in Yup validation.
- [x] **URL Protocol Whitelisting**: Enforced strict `http://` / `https://` protocol checks via `new URL()` to prevent XSS (`javascript:`) or malformed redirects.
- [x] **Optimized Click Aggregation**: Replaced `select("*")` on `clicks` table with Supabase PostgREST's `{ count: "exact", head: true }` in `src/db/apiClicks.js` (`getClicksCountForUrls`), reducing dashboard payload from megabytes to ~100 bytes.

---

## ✅ Phase 2: Backend API & Fast Redirect Engine (COMPLETED)
*Git Commit: `96ad3a0`*

- [x] **Express Backend Service**: Added Node.js/Express server in `server/index.js` running on port 5000.
- [x] **Instant HTTP 302 Redirect Route**:
  - Endpoint: `server/routes/redirect.js` mounted at `GET /r/:slug` and root fallback `GET /:slug`.
  - Resolves destination URL from Supabase in ~2ms.
  - Returns native HTTP `302 Found` with `Location` header.
  - Redirect latency dropped from 2,000ms+ down to ~30–50ms.
  - Downloads 0 bytes of HTML/CSS/JS during redirect.
- [x] **Server-Side Offline Geolocation**:
  - File: `server/lib/geo.js` using `geoip-lite` and `ua-parser-js`.
  - Resolves visitor city and country from IP address in memory (0ms network delay).
  - Immune to browser ad-blockers (unlike client-side `ipapi.co`).
  - Asynchronously logs click to Supabase *after* sending the redirect header (zero visitor wait time).
- [x] **Vite Dev Proxy**: Configured `vite.config.js` to proxy `/r` to `http://localhost:5000` during development.
- [x] **Scripts Added to package.json**: `"server": "node server/index.js"`, `"server:dev": "node --watch server/index.js"`.

---

## 🚀 Phase 3: Redis Caching, Rate Limiting & Bot Filtering (NEXT UP)
*Goal: Scalability and protection against traffic spikes, bot pollution, and API abuse.*

### Tasks to Implement:
1. **Redis Caching for Short URLs**:
   - Connect backend to Redis (using `ioredis`).
   - Cache pattern: `link:{slug}` -> `original_url`.
   - On redirect request: check Redis cache first.
     - **Cache Hit**: Redirect immediately in < 5ms without querying PostgreSQL.
     - **Cache Miss**: Fetch from Supabase, store in Redis with TTL (e.g., 24 hours), then redirect.
   - Cache Invalidation: When a user deletes or updates a link, invalidate `link:{slug}` in Redis.
2. **Rate Limiting (Abuse Prevention)**:
   - Use `rate-limiter-flexible` or Redis sliding-window counter.
   - Limit redirect hits per IP (e.g. 120 requests / minute) to prevent scraping / DoS.
   - Limit URL creation per IP (e.g. 20 creations / hour) to stop automated spamming.
3. **Bot Filtering & Click Deduplication**:
   - Use `isbot` package to identify crawlers (Twitterbot, Slackbot, Discordbot, FacebookExternalHit).
   - If a crawler requests the link for preview, issue the redirect but **do not insert a click record**.
   - Implement 2-minute deduplication window in Redis: `click:dedup:{url_id}:{ip_hash}` to prevent rapid reload click count inflation.

### Technologies Involved:
- `ioredis` (or `@upstash/redis` for serverless/cloud Redis)
- `isbot`
- `rate-limiter-flexible`

### Files to Touch in Phase 3:
- `server/lib/redis.js` (Redis client initialization & graceful fallback if Redis is offline)
- `server/middleware/rateLimiter.js` (Rate limiting middleware)
- `server/routes/redirect.js` (Integrate cache check, bot check, and deduplication)
- `package.json` (Add `ioredis`, `isbot`, `rate-limiter-flexible`)

---

## 🔮 Phase 4: Containerization & CI/CD (UPCOMING)
- Multi-stage `Dockerfile` for backend API and frontend static assets.
- `docker-compose.yml` orchestrating API, Redis, and Frontend.
- GitHub Actions CI workflow (`.github/workflows/ci.yml`) for linting, testing, and build verification.

---

## 🔮 Phase 5: Observability & Production Hardening (UPCOMING)
- Sentry integration across frontend React and backend Express for exception tracking.
- Structured JSON logging using `pino`.
- Production deployment configuration (Cloudflare Pages for frontend, Fly.io / Render for API & Redis).
