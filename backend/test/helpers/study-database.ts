import type { Database } from '../../src/infrastructure/database';

// Caller first opens the guarded biblia_test identity. These are owned study
// tables and a named technical fault fixture, never development or source data.
export async function cleanStudyTestData(database: Database): Promise<void> {
  await database.client.$transaction(async transaction => {
    await transaction.$executeRaw`LOCK TABLE app.study_record,app.study_version IN SHARE ROW EXCLUSIVE MODE`;
    await transaction.$executeRaw`DROP TRIGGER IF EXISTS study_test_fail_append ON app.study_version`;
    await transaction.$executeRaw`DROP FUNCTION IF EXISTS app.study_test_fail_append()`;
    await transaction.studyVersion.deleteMany(); await transaction.studyRecord.deleteMany();
  });
}
export async function failStudyVersionWrite(database: Database, number: 1 | 2): Promise<void> {
  await database.client.$executeRaw`CREATE FUNCTION app.study_test_fail_append() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'controlled-study-write-failure'; END $$`;
  // The number is the closed technical fixture matrix above, not request data.
  await database.client.$executeRawUnsafe(`CREATE TRIGGER study_test_fail_append BEFORE INSERT ON app.study_version FOR EACH ROW WHEN (NEW.number=${number}) EXECUTE FUNCTION app.study_test_fail_append()`);
}
