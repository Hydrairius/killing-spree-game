-- Bug reports table for Cloudflare D1
-- Stores report metadata + JSON (screenshot and log omitted to stay under D1 row limits)
CREATE TABLE IF NOT EXISTS bug_reports (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL,
  repro_rate TEXT NOT NULL,
  build_version TEXT,
  current_scene TEXT,
  platform TEXT,
  player_contact TEXT,
  report_json TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON bug_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bug_reports_category ON bug_reports(category);
CREATE INDEX IF NOT EXISTS idx_bug_reports_severity ON bug_reports(severity);
