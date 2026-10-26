import express from "express";
import process from "node:process";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import redirectRoutes from "./routes/redirect.js";
import urlRoutes from "./routes/urls.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.set("trust proxy", process.env.TRUST_PROXY || false);

// Health check endpoint
app.get("/healthz", (req, res) => {
  res.json({
    status: "healthy",
    service: "trimrr-backend-api",
    timestamp: new Date().toISOString(),
  });
});

// Fast Redirect Route mounted at /r/:slug
app.use("/r", redirectRoutes);
app.use("/api/urls", urlRoutes);

// Serve frontend static build if built (Production Mode)
const distPath = path.resolve(__dirname, "../dist");
app.use(express.static(distPath));

// Fallback: If a direct top-level slug (e.g. /my-promo) hits the server, redirect it
const RESERVED_SLUGS = [
  "auth",
  "dashboard",
  "link",
  "api",
  "assets",
  "favicon.ico",
  "robots.txt",
  "healthz",
];

app.get("/:slug", (req, res, next) => {
  const { slug } = req.params;

  // If it's a known frontend page or asset, let the SPA handler serve it
  if (RESERVED_SLUGS.includes(slug) || slug.includes(".")) {
    return next();
  }

  // Forward to redirect router
  return redirectRoutes(req, res, next);
});

// Single Page Application (SPA) catch-all
app.use((req, res) => {
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) {
      res
        .status(404)
        .send(
          "Trimrr Server is running. To serve the frontend, run 'npm run build' first."
        );
    }
  });
});

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Trimrr Backend API Server running at http://localhost:${PORT}`);
  console.log(`⚡ Fast Redirect Route: http://localhost:${PORT}/r/:slug`);
  console.log(`🩺 Health Probe:       http://localhost:${PORT}/healthz`);
  console.log(`==================================================\n`);
});
