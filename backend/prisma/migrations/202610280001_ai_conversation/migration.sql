-- Owned by ai-assistant; study/source-library stay behind public ports.
CREATE TABLE app.ai_conversation (
    id UUID PRIMARY KEY,
    owner_id TEXT NOT NULL CHECK (owner_id ~ '^[A-Za-z0-9]' AND owner_id !~ '[^A-Za-z0-9._-]' AND length(owner_id) BETWEEN 1 AND 64),
    study_id UUID NOT NULL,
    study_version BIGINT NOT NULL CHECK (study_version BETWEEN 1 AND 9007199254740991),
    revision INTEGER NOT NULL CHECK (revision BETWEEN 0 AND 20),
    document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object' AND document @> '{"schemaVersion":1}'::jsonb),
    created_at TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT ai_conversation_turn_count CHECK (
      CASE WHEN jsonb_typeof(document->'turns') = 'array'
        THEN jsonb_array_length(document->'turns') = revision
        ELSE FALSE END
    )
);
CREATE INDEX ai_conversation_owner_id_idx ON app.ai_conversation(owner_id,id);
