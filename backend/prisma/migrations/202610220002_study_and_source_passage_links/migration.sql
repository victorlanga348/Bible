-- Associations belong to source-library; no foreign key crosses to canon.
CREATE TABLE app.source_library_passage_link (
    id TEXT PRIMARY KEY,
    excerpt_id TEXT NOT NULL,
    translation_id TEXT NOT NULL,
    book_code TEXT NOT NULL,
    chapter BIGINT NOT NULL CHECK (chapter BETWEEN 1 AND 9007199254740991),
    from_verse BIGINT NOT NULL CHECK (from_verse BETWEEN 1 AND 9007199254740991),
    to_verse BIGINT NOT NULL CHECK (to_verse BETWEEN 1 AND 9007199254740991),
    nature TEXT NOT NULL CHECK (nature = 'narrative-parallel'),
    rationale TEXT NOT NULL CHECK (length(btrim(rationale, E' \t\n\r')) > 0),
    CONSTRAINT source_library_passage_link_id_check CHECK (id ~ '^[a-z0-9]' AND id !~ '[^a-z0-9-]'),
    CONSTRAINT source_library_passage_link_excerpt_id_check CHECK (excerpt_id ~ '^[a-z0-9]' AND excerpt_id !~ '[^a-z0-9-]'),
    CONSTRAINT source_library_passage_link_translation_id_check CHECK (translation_id ~ '^[a-z0-9]' AND translation_id !~ '[^a-z0-9-]'),
    CONSTRAINT source_library_passage_link_book_code_check CHECK (length(book_code) = 3 AND book_code !~ '[^A-Z0-9]'),
    CONSTRAINT source_library_passage_link_range_check CHECK (to_verse >= from_verse),
    CONSTRAINT source_library_passage_link_excerpt_id_fkey FOREIGN KEY (excerpt_id) REFERENCES app.source_library_excerpt(id) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX source_library_passage_link_selection_idx ON app.source_library_passage_link(translation_id, book_code, chapter, from_verse, to_verse);

-- Only study owns these records/documents; evidence keeps a historical snapshot.
CREATE TABLE app.study_record (
    id UUID PRIMARY KEY,
    owner_id TEXT NOT NULL CHECK (owner_id ~ '^[A-Za-z0-9]' AND owner_id !~ '[^A-Za-z0-9._-]' AND length(owner_id) BETWEEN 1 AND 64),
    current_version BIGINT NOT NULL CHECK (current_version BETWEEN 1 AND 9007199254740991),
    created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX study_record_owner_created_id_idx ON app.study_record(owner_id, created_at DESC, id DESC);

CREATE TABLE app.study_version (
    study_id UUID NOT NULL,
    number BIGINT NOT NULL CHECK (number BETWEEN 1 AND 9007199254740991),
    document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object'),
    created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT study_version_pkey PRIMARY KEY (study_id, number),
    CONSTRAINT study_version_study_id_fkey FOREIGN KEY (study_id) REFERENCES app.study_record(id) ON DELETE CASCADE ON UPDATE RESTRICT
);
