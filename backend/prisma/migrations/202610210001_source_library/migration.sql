-- Module-owned snapshot metadata and authentic excerpts. No persistent text index.
CREATE TABLE "app"."source_library_source" (
  "id" TEXT PRIMARY KEY CHECK (length(id) > 0 AND id !~ '[^a-z0-9-]'),
  "title" TEXT NOT NULL CHECK (title ~ '[^[:space:]]'),
  "author" TEXT NOT NULL CHECK (author ~ '[^[:space:]]'),
  "translator" TEXT CHECK (translator IS NULL OR translator ~ '[^[:space:]]'),
  "language" TEXT NOT NULL CHECK (language ~ '[^[:space:]]'),
  "edition" TEXT NOT NULL CHECK (edition ~ '[^[:space:]]'),
  "kind" TEXT NOT NULL CHECK (kind IN ('historical-work', 'modern-study', 'commentary')),
  "origin_url" TEXT NOT NULL CHECK (origin_url ~ '[^[:space:]]'),
  "snapshot_sha256" TEXT NOT NULL CHECK (length(snapshot_sha256) = 64 AND snapshot_sha256 !~ '[^a-fA-F0-9]'),
  "retrieved_at" TEXT NOT NULL CHECK (retrieved_at ~ '[^[:space:]]'),
  "rights_statement" TEXT NOT NULL CHECK (rights_statement ~ '[^[:space:]]'),
  "rights_url" TEXT NOT NULL CHECK (rights_url ~ '[^[:space:]]'),
  "attribution" TEXT NOT NULL CHECK (attribution ~ '[^[:space:]]'),
  "permissions" JSONB NOT NULL CHECK (
    jsonb_typeof(permissions) = 'object'
    AND permissions ?& ARRAY['ingest', 'store', 'index', 'display', 'quote', 'sendToAi']
    AND permissions - ARRAY['ingest', 'store', 'index', 'display', 'quote', 'sendToAi'] = '{}'::jsonb
    AND permissions->>'ingest' IN ('allowed', 'pending', 'denied')
    AND permissions->>'store' IN ('allowed', 'pending', 'denied')
    AND permissions->>'index' IN ('allowed', 'pending', 'denied')
    AND permissions->>'display' IN ('allowed', 'pending', 'denied')
    AND permissions->>'quote' IN ('allowed', 'pending', 'denied')
    AND permissions->>'sendToAi' IN ('allowed', 'pending', 'denied')
  ),
  "limitations" TEXT NOT NULL CHECK (limitations ~ '[^[:space:]]')
);

CREATE TABLE "app"."source_library_excerpt" (
  "id" TEXT PRIMARY KEY CHECK (length(id) > 0 AND id !~ '[^a-z0-9-]'),
  "source_id" TEXT NOT NULL REFERENCES "app"."source_library_source"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "locator" TEXT NOT NULL CHECK (locator ~ '[^[:space:]]'),
  "order" BIGINT NOT NULL CHECK ("order" > 0 AND "order" <= 9007199254740991),
  "text" TEXT NOT NULL CHECK (text ~ '[^[:space:]]'),
  "text_sha256" TEXT NOT NULL CHECK (length(text_sha256) = 64 AND text_sha256 !~ '[^a-fA-F0-9]'),
  "origin_url" TEXT CHECK (origin_url IS NULL OR origin_url ~ '[^[:space:]]'),
  CONSTRAINT "source_library_excerpt_source_locator_key" UNIQUE ("source_id", "locator"),
  CONSTRAINT "source_library_excerpt_source_order_key" UNIQUE ("source_id", "order")
);
