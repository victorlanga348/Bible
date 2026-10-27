-- This migration is only for the guarded independent AI target (or isolated test schema).
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;
CREATE SCHEMA IF NOT EXISTS ai;
CREATE TABLE ai.embedding_profile (
    id TEXT PRIMARY KEY CHECK (id ~ '^[a-z0-9]' AND id !~ '[^a-z0-9-]'),
    configuration JSONB NOT NULL CHECK (jsonb_typeof(configuration) = 'object'),
    completed_at TIMESTAMPTZ(3) NOT NULL
);
CREATE TABLE ai.source_chunk (
    profile_id TEXT NOT NULL,
    id TEXT NOT NULL CHECK (id ~ '^[a-z0-9]' AND id !~ '[^a-z0-9-]'),
    source_id TEXT NOT NULL CHECK (source_id ~ '^[a-z0-9]' AND source_id !~ '[^a-z0-9-]'),
    excerpt_id TEXT NOT NULL CHECK (excerpt_id ~ '^[a-z0-9]' AND excerpt_id !~ '[^a-z0-9-]'),
    source_digest TEXT NOT NULL CHECK (length(source_digest) = 64 AND source_digest !~ '[^a-f0-9]'),
    text_digest TEXT NOT NULL CHECK (length(text_digest) = 64 AND text_digest !~ '[^a-f0-9]'),
    start_offset BIGINT NOT NULL CHECK (start_offset BETWEEN 0 AND 9007199254740991),
    end_offset BIGINT NOT NULL CHECK (end_offset BETWEEN 1 AND 9007199254740991 AND end_offset > start_offset),
    embedding public.vector(1024) NOT NULL CHECK (public.vector_norm(embedding) BETWEEN 0.9999 AND 1.0001),
    CONSTRAINT source_chunk_pkey PRIMARY KEY (profile_id,excerpt_id,id),
    CONSTRAINT source_chunk_profile_fkey FOREIGN KEY (profile_id) REFERENCES ai.embedding_profile(id) ON DELETE CASCADE ON UPDATE RESTRICT
);
