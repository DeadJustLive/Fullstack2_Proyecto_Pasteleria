-- Migration: create error_log_batches table for daily batch error logging
-- Replaces individual INSERTs per error with 1 row/day batch
-- Saves Free Plan row limit (50k rows/month)
-- Related to BUG-027 / SUPABASE-008

CREATE TABLE IF NOT EXISTS error_log_batches (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    errors_batch JSONB NOT NULL DEFAULT '[]',
    count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for quick lookups by date
CREATE INDEX IF NOT EXISTS idx_error_log_batches_date ON error_log_batches (date);
