-- PostgreSQL CHECK accepts UNKNOWN. JSON null must not bypass a required status.
ALTER TABLE "app"."source_library_source"
  ADD CONSTRAINT "source_library_source_permission_values_not_null" CHECK (
    permissions->>'ingest' IS NOT NULL
    AND permissions->>'store' IS NOT NULL
    AND permissions->>'index' IS NOT NULL
    AND permissions->>'display' IS NOT NULL
    AND permissions->>'quote' IS NOT NULL
    AND permissions->>'sendToAi' IS NOT NULL
  );
