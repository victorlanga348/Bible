CREATE TABLE app.canon_translation (
  id TEXT PRIMARY KEY CHECK (id ~ '^[a-z0-9][a-z0-9-]*$'),
  name TEXT NOT NULL CHECK (name ~ '[^[:space:]]'),
  language TEXT NOT NULL CHECK (language ~ '[^[:space:]]'),
  canon_id TEXT NOT NULL CHECK (canon_id ~ '[^[:space:]]'),
  source_url TEXT NOT NULL CHECK (source_url ~ '[^[:space:]]'),
  source_sha256 TEXT NOT NULL CHECK (source_sha256 ~ '^[a-fA-F0-9]{64}$'),
  retrieved_at TEXT NOT NULL CHECK (retrieved_at ~ '[^[:space:]]'),
  license_id TEXT NOT NULL CHECK (license_id ~ '[^[:space:]]'),
  license_url TEXT NOT NULL CHECK (license_url ~ '[^[:space:]]'),
  attribution TEXT NOT NULL CHECK (attribution ~ '[^[:space:]]')
);
CREATE TABLE app.canon_book (
  translation_id TEXT NOT NULL REFERENCES app.canon_translation(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  code TEXT NOT NULL CHECK (code ~ '^[A-Z0-9]{3}$'),
  name TEXT NOT NULL CHECK (name ~ '[^[:space:]]'),
  "order" BIGINT NOT NULL CHECK ("order" BETWEEN 1 AND 9007199254740991),
  PRIMARY KEY (translation_id, code),
  UNIQUE (translation_id, "order")
);
CREATE TABLE app.canon_chapter (
  translation_id TEXT NOT NULL,
  book_code TEXT NOT NULL,
  number BIGINT NOT NULL CHECK (number BETWEEN 1 AND 9007199254740991),
  PRIMARY KEY (translation_id, book_code, number),
  FOREIGN KEY (translation_id, book_code) REFERENCES app.canon_book(translation_id, code) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE app.canon_verse (
  translation_id TEXT NOT NULL,
  book_code TEXT NOT NULL,
  chapter BIGINT NOT NULL,
  number BIGINT NOT NULL CHECK (number BETWEEN 1 AND 9007199254740991),
  text TEXT NOT NULL CHECK (text ~ '[^[:space:]]'),
  PRIMARY KEY (translation_id, book_code, chapter, number),
  FOREIGN KEY (translation_id, book_code, chapter) REFERENCES app.canon_chapter(translation_id, book_code, number) ON DELETE RESTRICT ON UPDATE CASCADE
);
