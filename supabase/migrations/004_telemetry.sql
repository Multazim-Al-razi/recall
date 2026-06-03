-- Telemetry events table for anonymized product health tracking.
-- No PII is stored: only the event type, a category bucket,
-- and a broad amount-range bucket are recorded.

CREATE TABLE IF NOT EXISTS telemetry_events (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event       TEXT        NOT NULL,
  category    TEXT        NULL,
  amount_bucket TEXT      NULL,
  timestamp   TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for querying recent events by type
CREATE INDEX idx_telemetry_event_ts ON telemetry_events (event, timestamp DESC);

-- Service role can insert (used by the backend /api/stats/event endpoint).
-- No public access — events are only written by the backend, never read by users.
ALTER TABLE telemetry_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert telemetry events"
  ON telemetry_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can read telemetry events"
  ON telemetry_events
  FOR SELECT
  TO service_role
  USING (true);
