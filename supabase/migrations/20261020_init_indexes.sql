-- ==============================================================================
-- Trimrr — Phase 1 Database Migration: Performance & Foreign Key Indexes
-- File: supabase/migrations/20261020_init_indexes.sql
-- ==============================================================================
-- Purpose:
--   1. Eliminate sequential full table scans on 'urls' by indexing 'user_id'.
--   2. Eliminate sequential full table scans on 'clicks' by indexing 'url_id'.
--   3. Provide composite time-series index for chronological click analytics.
--
-- Instructions:
--   Open your Supabase Project Dashboard -> SQL Editor -> New Query -> Paste & Run.
-- ==============================================================================

-- 1. Index on urls(user_id)
-- Used when loading dashboard URLs for authenticated users (getUrls query)
CREATE INDEX IF NOT EXISTS idx_urls_user_id ON urls(user_id);

-- 2. Index on clicks(url_id)
-- Used when aggregating clicks for multiple URLs or individual link analytics
CREATE INDEX IF NOT EXISTS idx_clicks_url_id ON clicks(url_id);

-- 3. Composite Index on clicks(url_id, created_at DESC)
-- Optimizes time-series analytics, date filtering, and latest click ordering
CREATE INDEX IF NOT EXISTS idx_clicks_url_id_created_at ON clicks(url_id, created_at DESC);

-- ==============================================================================
-- Verification Queries (Optional: run to confirm planner uses index scans)
-- ==============================================================================
-- EXPLAIN ANALYZE SELECT * FROM urls WHERE user_id = '00000000-0000-0000-0000-000000000000';
-- EXPLAIN ANALYZE SELECT count(*) FROM clicks WHERE url_id = 1;
