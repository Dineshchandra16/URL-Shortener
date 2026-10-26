# 🗺️ Trimrr — Production Architecture Roadmap & Progress

This document tracks the complete, step-by-step production roadmap for Trimrr. Any AI agent or developer can read this file to understand the current system status and immediately continue with any phase without needing prior conversation history.

---

## 📌 Overall Project Architecture

Trimrr is a full-stack URL Shortener & Analytics SaaS platform:
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
   - Connect backend to Redis using `ioredis` (with graceful fallback if Redis is unreachable).
   - Cache pattern: `link:{slug}` -> `original_url`.
   - On redirect request (`GET /r/:slug`): check Redis cache first.
     - **Cache Hit**: Redirect immediately in < 5ms without querying PostgreSQL.
     - **Cache Miss**: Fetch from Supabase, store in Redis with TTL (e.g., 24 hours), then redirect.
   - Cache Invalidation: Invalidate `link:{slug}` in Redis when a link is deleted or updated.
2. **Rate Limiting (Abuse Prevention)**:
   - Use `rate-limiter-flexible` or Redis sliding-window counter.
   - Limit redirect hits per IP (e.g., 120 requests / minute) to prevent scraping / DoS.
   - Limit URL creation per IP (e.g., 20 creations / hour) to stop automated spamming.
3. **Bot Filtering & Click Deduplication**:
   - Use `isbot` package to identify crawlers (Twitterbot, Slackbot, Discordbot, FacebookExternalHit).
   - If a crawler requests the link for preview, issue the redirect but **do not insert a click record**.
   - Implement 2-minute deduplication window in Redis: `click:dedup:{url_id}:{ip_hash}` to prevent rapid reload click count inflation.

### Technologies Involved:
- `ioredis` (or `@upstash/redis` for serverless/cloud Redis)
- `isbot`
- `rate-limiter-flexible`

### Files to Touch in Phase 3:
- `server/lib/redis.js` (Redis client initialization & fallback logic)
- `server/middleware/rateLimiter.js` (Rate limiting middleware)
- `server/routes/redirect.js` (Integrate cache check, bot check, and deduplication)
- `package.json` (Add `ioredis`, `isbot`, `rate-limiter-flexible`)

### Acceptance Criteria for Phase 3:
- Repeated requests to the same short link return HTTP 302 in `< 10 ms` via Redis cache hit.
- Exceeding the rate limit returns `HTTP 429 Too Many Requests`.
- Bot User-Agents receive the redirect but do not create false rows in the `clicks` table.

---

## 📦 Phase 4: Containerization & CI/CD Pipelines
*Goal: Standardize developer workflow, ensure reproducible deployments, and automate quality checks.*

### Tasks to Implement:
1. **Docker Containerization**:
   - Multi-stage `Dockerfile` building frontend assets and running the Node.js Express server.
   - `.dockerignore` excluding `node_modules`, `dist`, `.git`, and environment secrets.
   - `docker-compose.yml` orchestrating:
     - `api`: Node.js backend container on port 5000.
     - `redis`: Redis Alpine container on port 6379 with persistent volume and healthcheck.
     - `web`: Frontend development / Nginx container.
2. **Automated Testing Setup**:
   - Install `vitest`, `@testing-library/react`, and `supertest`.
   - Add unit tests for URL validation, reserved slug checks, and theme toggling.
   - Add integration tests for Express API redirect routes (`GET /r/:slug`, `GET /healthz`).
3. **GitHub Actions CI/CD**:
   - Create `.github/workflows/ci.yml`.
   - Automated workflow triggered on every push and pull request to `main` / `master`.
   - Steps:
     1. Checkout repository.
     2. Setup Node.js (v18 / v20).
     3. Install dependencies (`npm ci`).
     4. Run code linter (`npm run lint`).
     5. Run test suite (`npm run test`).
     6. Run production build (`npm run build`).
4. **Environment Schema Validation**:
   - Add Zod or `dotenv-safe` configuration schema in `server/config/env.js` to validate required environment variables on server boot.

### Files to Touch in Phase 4:
- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- `.github/workflows/ci.yml`
- `server/config/env.js`
- `package.json` (Add test scripts and dev dependencies: `vitest`, `supertest`)

### Acceptance Criteria for Phase 4:
- Running `docker compose up` starts the entire Trimrr stack locally in one command.
- Pull requests trigger GitHub Actions and block merges if tests or build checks fail.

---

## 🛡️ Phase 5: Observability, Monitoring & Production Deployment
*Goal: Full operational visibility, proactive alert monitoring, and deployment readiness.*

### Tasks to Implement:
1. **Sentry Error Tracking**:
   - Frontend: Install `@sentry/react` in `src/main.jsx` with React error boundaries and performance tracing.
   - Backend: Install `@sentry/node` in `server/index.js` to capture unhandled exceptions, database errors, and 500 status codes.
2. **Structured JSON Logging**:
   - Install `pino` and `pino-http` logger in Express.
   - Each HTTP request logs structured JSON with unique correlation request IDs (`x-request-id`), response time in milliseconds, and status codes.
3. **Health & Readiness Probes**:
   - `GET /healthz`: Basic process liveness probe.
   - `GET /readyz`: Readiness probe verifying Supabase PostgreSQL and Redis connectivity before routing traffic.
4. **Production Deployment Configuration**:
   - Frontend: Deploy to Cloudflare Pages or Vercel (free global edge CDN with automatic SSL).
   - Backend API & Redis: Deploy to Fly.io, Render, or Railway with persistent environment variables.

### Files to Touch in Phase 5:
- `src/main.jsx` (Sentry React initialization)
- `server/index.js` (Sentry Node initialization & Pino middleware)
- `server/lib/logger.js` (Pino logger configuration)
- `server/routes/health.js` (Liveness and readiness probes)
- `package.json` (Add `@sentry/react`, `@sentry/node`, `pino`, `pino-http`)

### Acceptance Criteria for Phase 5:
- Unhandled errors in production automatically emit alert notifications in Sentry.
- Server logs are machine-readable structured JSON with latency metrics.
- `/readyz` returns HTTP 200 when all backing services are healthy and HTTP 503 if a dependency fails.
