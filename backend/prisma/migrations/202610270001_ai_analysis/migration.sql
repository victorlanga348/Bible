-- Owned by ai-assistant. Study/source/canon are accessed through public ports, never FKs.
CREATE TABLE app.ai_analysis (
    id UUID PRIMARY KEY,
    owner_id TEXT NOT NULL CHECK (owner_id ~ '^[A-Za-z0-9]' AND owner_id !~ '[^A-Za-z0-9._-]' AND length(owner_id) BETWEEN 1 AND 64),
    study_id UUID NOT NULL,
    study_version BIGINT NOT NULL CHECK (study_version BETWEEN 1 AND 9007199254740991),
    document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object' AND document @> '{"schemaVersion":1}'::jsonb),
    created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX ai_analysis_owner_id_idx ON app.ai_analysis(owner_id,id);
