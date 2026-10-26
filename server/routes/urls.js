import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import process from "node:process";
import { supabase } from "../lib/supabase.js";
import { invalidateLink } from "../lib/redis.js";
import { createUrlRateLimit } from "../middleware/rateLimiter.js";

const router = Router();
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_KEY;

async function getUserClient(req, res) {
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    res.status(401).json({ error: "Authentication required." });
    return null;
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: "Invalid or expired session." });
    return null;
  }

  return {
    user: data.user,
    client: createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    }),
  };
}

router.post("/", createUrlRateLimit, async (req, res) => {
  try {
    const userContext = await getUserClient(req, res);
    if (!userContext) return;
    const { client, user } = userContext;
    const { title, user_id, original_url, custom_url, short_url, qr } = req.body;
    if (!original_url || !short_url || !qr) {
      return res.status(400).json({ error: "A destination URL, short URL, and QR code are required." });
    }

    if (user_id && user_id !== user.id) {
      return res.status(403).json({ error: "You can only create links for your own account." });
    }

    const { data, error } = await client.from("urls").insert([{
      title,
      user_id: user.id,
      original_url,
      custom_url: custom_url || null,
      short_url,
      qr,
    }]).select();
    if (error) {
      return res.status(error.code === "23505" ? 409 : 400).json({ error: error.message });
    }
    return res.status(201).json(data);
  } catch (error) {
    console.error("Create URL error:", error);
    return res.status(500).json({ error: "Unable to create short URL." });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const userContext = await getUserClient(req, res);
    if (!userContext) return;
    const { client } = userContext;
    const { data: previous, error: lookupError } = await client
      .from("urls").select("id, short_url, custom_url").eq("id", req.params.id).single();
    if (lookupError || !previous) return res.status(404).json({ error: "Short URL not found." });

    const updates = {};
    for (const field of ["title", "original_url", "custom_url", "short_url", "qr"]) {
      if (Object.hasOwn(req.body, field)) updates[field] = req.body[field];
    }
    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: "No supported fields were provided." });
    }

    const { data, error } = await client.from("urls").update(updates)
      .eq("id", req.params.id).select().single();
    if (error) return res.status(error.code === "23505" ? 409 : 400).json({ error: error.message });
    const aliases = new Set([previous.short_url, previous.custom_url, data.short_url, data.custom_url]);
    await Promise.all([...aliases].filter(Boolean).map(invalidateLink));
    return res.json(data);
  } catch (error) {
    console.error("Update URL error:", error);
    return res.status(500).json({ error: "Unable to update short URL." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const userContext = await getUserClient(req, res);
    if (!userContext) return;
    const { client } = userContext;
    const { data: link, error: lookupError } = await client
      .from("urls").select("id, short_url, custom_url").eq("id", req.params.id).single();
    if (lookupError || !link) return res.status(404).json({ error: "Short URL not found." });

    const { error } = await client.from("urls").delete().eq("id", req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    await Promise.all([
      invalidateLink(link.short_url),
      link.custom_url ? invalidateLink(link.custom_url) : Promise.resolve(),
    ]);
    return res.status(204).end();
  } catch (error) {
    console.error("Delete URL error:", error);
    return res.status(500).json({ error: "Unable to delete short URL." });
  }
});

export default router;
