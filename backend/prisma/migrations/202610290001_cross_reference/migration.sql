CREATE TABLE app.cross_reference (
  id UUID PRIMARY KEY,
  owner_id TEXT NOT NULL CHECK (owner_id ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$'),
  from_translation_id TEXT NOT NULL CHECK (from_translation_id ~ '^[a-z0-9][a-z0-9-]{0,63}$'),
  from_book_code TEXT NOT NULL CHECK (from_book_code ~ '^[A-Z0-9]{3}$'),
  from_chapter BIGINT NOT NULL CHECK (from_chapter BETWEEN 1 AND 9007199254740991),
  from_verse_start BIGINT NOT NULL CHECK (from_verse_start BETWEEN 1 AND 9007199254740991),
  from_verse_end BIGINT NOT NULL CHECK (from_verse_end BETWEEN from_verse_start AND 9007199254740991),
  to_translation_id TEXT NOT NULL CHECK (to_translation_id ~ '^[a-z0-9][a-z0-9-]{0,63}$'),
  to_book_code TEXT NOT NULL CHECK (to_book_code ~ '^[A-Z0-9]{3}$'),
  to_chapter BIGINT NOT NULL CHECK (to_chapter BETWEEN 1 AND 9007199254740991),
  to_verse_start BIGINT NOT NULL CHECK (to_verse_start BETWEEN 1 AND 9007199254740991),
  to_verse_end BIGINT NOT NULL CHECK (to_verse_end BETWEEN to_verse_start AND 9007199254740991),
  document JSONB NOT NULL,
  created_at TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT cross_reference_document_check CHECK ((
    jsonb_typeof(document) = 'object' AND document->'schemaVersion' = '1'::jsonb
    AND jsonb_typeof(document->'from') = 'object' AND jsonb_typeof(document->'to') = 'object'
    AND jsonb_typeof(document->'evidence') = 'array' AND jsonb_array_length(document->'evidence') BETWEEN 1 AND 4
    AND jsonb_typeof(document->'rationale') = 'string' AND octet_length(document->>'rationale') BETWEEN 1 AND 2000
    AND btrim(document->>'rationale') = document->>'rationale'
    AND document->>'type' IN ('citation','allusion','thematic-parallel','prophetic-relation')
    AND CASE WHEN document->>'type' = 'prophetic-relation' THEN document->>'reading' IN ('historical','messianic','eschatological') ELSE document->>'reading' = 'textual' END
  ) IS TRUE)
);
CREATE INDEX cross_reference_owner_created_id_idx ON app.cross_reference(owner_id,created_at DESC,id DESC);
CREATE INDEX cross_reference_owner_from_lookup_idx ON app.cross_reference(owner_id,from_translation_id,from_book_code,from_chapter);
CREATE INDEX cross_reference_owner_to_lookup_idx ON app.cross_reference(owner_id,to_translation_id,to_book_code,to_chapter);
