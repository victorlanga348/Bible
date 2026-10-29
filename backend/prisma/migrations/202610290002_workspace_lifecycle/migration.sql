ALTER TABLE app.study_record ADD COLUMN lifecycle TEXT NOT NULL DEFAULT 'active' CHECK (lifecycle IN ('active','deleting'));
CREATE INDEX ai_conversation_owner_study_created_id_idx ON app.ai_conversation(owner_id,study_id,created_at DESC,id DESC);
CREATE TABLE app.workspace_note (
 id UUID PRIMARY KEY,
 owner_id TEXT NOT NULL CHECK (owner_id ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$'),
 study_id UUID NOT NULL,
 study_version BIGINT NOT NULL CHECK (study_version BETWEEN 1 AND 9007199254740991),
 revision INTEGER NOT NULL CHECK (revision BETWEEN 1 AND 2147483647),
 content TEXT NOT NULL CHECK (octet_length(content) BETWEEN 1 AND 8000 AND btrim(content)=content),
 created_at TIMESTAMPTZ(3) NOT NULL,
 updated_at TIMESTAMPTZ(3) NOT NULL CHECK (updated_at>=created_at)
);
CREATE INDEX workspace_note_owner_study_created_id_idx ON app.workspace_note(owner_id,study_id,created_at DESC,id DESC);
CREATE TABLE app.workspace_favorite (
 id UUID PRIMARY KEY,
 owner_id TEXT NOT NULL CHECK (owner_id ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$'),
 study_id UUID NOT NULL,
 study_version BIGINT NOT NULL CHECK (study_version BETWEEN 1 AND 9007199254740991),
 created_at TIMESTAMPTZ(3) NOT NULL,
 CONSTRAINT workspace_favorite_owner_study_version_key UNIQUE(owner_id,study_id,study_version)
);
CREATE INDEX workspace_favorite_owner_created_id_idx ON app.workspace_favorite(owner_id,created_at DESC,id DESC);
