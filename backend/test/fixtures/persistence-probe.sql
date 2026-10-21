-- Apply exclusively to the guarded test database, never development/production.
CREATE TABLE IF NOT EXISTS app.persistence_probe (
  id TEXT PRIMARY KEY,
  payload TEXT NOT NULL CHECK (length(payload) > 0)
);
