import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { parseVisitor } from "../lib/geo.js";

const router = Router();

// Fast HTTP 302 Redirect Endpoint
router.get("/:slug", async (req, res) => {
  const { slug } = req.params;

  // Ignore static browser requests
  if (slug === "favicon.ico" || slug === "robots.txt") {
    return res.status(404).end();
  }

  try {
    // 1. Resolve destination URL from Supabase
    const { data: url, error } = await supabase
      .from("urls")
      .select("id, original_url")
      .or(`short_url.eq.${slug},custom_url.eq.${slug}`)
      .single();

    if (error || !url) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <title>Link Not Found — Trimrr</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0B1020; color: #F8FAFC; text-align: center; padding: 1rem; }
              .card { max-width: 420px; padding: 2.5rem 2rem; border-radius: 1rem; border: 1px solid #1E293B; background: #111827; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
              .icon { font-size: 2.5rem; margin-bottom: 1rem; }
              h1 { font-size: 1.5rem; margin: 0 0 0.5rem 0; color: #F8FAFC; font-weight: 700; }
              p { color: #94A3B8; font-size: 0.9rem; line-height: 1.5; margin: 0 0 1.5rem 0; }
              a { display: inline-block; padding: 0.7rem 1.5rem; background: #2563EB; color: #FFFFFF; border-radius: 0.5rem; text-decoration: none; font-weight: 600; font-size: 0.875rem; transition: background 0.2s; }
              a:hover { background: #1D4ED8; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="icon">🔗</div>
              <h1>Link Not Found</h1>
              <p>The short link you are trying to visit does not exist, has expired, or was removed.</p>
              <a href="/">Go to Homepage</a>
            </div>
          </body>
        </html>
      `);
    }

    // 2. Ensure destination URL starts with http:// or https://
    let target = url.original_url.trim();
    if (!target.startsWith("http://") && !target.startsWith("https://")) {
      target = `https://${target}`;
    }

    // 3. IMMEDIATE REDIRECT: HTTP 302 Found (Sub-50ms)
    // The browser redirects immediately without downloading HTML or React!
    res.redirect(302, target);

    // 4. ASYNCHRONOUS BACKGROUND CLICK LOGGING
    // Runs after the redirect header is sent so it does NOT delay the user!
    try {
      const { city, country, device } = parseVisitor(req);

      await supabase.from("clicks").insert({
        url_id: url.id,
        city,
        country,
        device,
      });
    } catch (logErr) {
      console.error("Background click logging error:", logErr.message);
    }
  } catch (err) {
    console.error("Redirect server error:", err);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
