import type { Database } from '../../src/infrastructure/database';
import { StudyInputError, StudyNotFoundError } from '../../src/modules/study/application/errors';
import { cleanCanon, seedCanon, canonVerses } from '../helpers/canon';
import { cleanSourceTestData, openSourceTestDatabase, seedCuratedSource } from '../helpers/source-library';
import { seedPassageLink, passageLinkProps } from '../helpers/passage-links';
import { realEvidence } from '../helpers/study';
import { createStudyTestServices } from '../helpers/study-runtime';

describe('deterministic structured study from real canon and curated sources', () => {
  let database: Database; let services: ReturnType<typeof createStudyTestServices>;
  beforeAll(async () => { database = await openSourceTestDatabase(); });
  beforeEach(async () => { await cleanSourceTestData(database); await cleanCanon(database); await seedCanon(database); await seedCuratedSource(database); await seedPassageLink(database); services = createStudyTestServices(database); });
  afterAll(async () => { if (database) { try { await cleanSourceTestData(database); await cleanCanon(database); } finally { await database.onModuleDestroy(); } } });
  it('keeps biblical wording, all six sections, explicit narrative evidence and epistemic limits', async () => {
    const study = await services.builder.execute('porbr2018', 'GEN 1:1');
    expect(study.reference.normalized).toBe('GEN 1:1'); expect(study.passage.verses).toEqual([{ number: 1, text: canonVerses[0]!.text }]);
    expect(study.sections.map(section => section.kind)).toEqual(['immediate-context', 'book-argument', 'history-culture', 'authorship-audience-purpose', 'comparison', 'interpretations']);
    expect(study.sections[0]).toMatchObject({ status: 'available', evidenceIds: [] }); expect(study.sections[0]!.text).toContain(canonVerses[0]!.text);
    expect(study.sections[4]).toEqual({ kind: 'comparison', status: 'available', text: passageLinkProps().rationale, evidenceIds: [realEvidence().excerptId] });
    expect(study.evidence).toEqual([realEvidence()]); expect(study.interpretations).toEqual([]); expect(study.limitations.length).toBeGreaterThan(0);
    for (const index of [1, 2, 3, 5]) expect(study.sections[index]!.status).toBe('insufficient-evidence');
  });
  it('retains available chapter context beyond the selection without inventing a source association', async () => {
    const study = await services.builder.execute('porbr2018', 'JHN 3:16');
    expect(study.passage.verses).toEqual([{ number: 16, text: canonVerses[1]!.text }]);
    for (const verse of canonVerses.slice(1)) expect(study.sections[0]!.text).toContain(verse.text);
    expect(study.evidence).toEqual([]); expect(study.interpretations).toEqual([]);
    expect(study.sections.slice(1).every(section => section.status === 'insufficient-evidence' && section.evidenceIds.length === 0)).toBe(true);
    expect(JSON.stringify(study)).not.toContain(realEvidence().quote);
  });
  it('does not generate content when the validated selection is absent or malformed', async () => {
    await expect(services.builder.execute('porbr2018', 'GEN 99:1')).rejects.toThrow(StudyNotFoundError);
    await expect(services.builder.execute('porbr2018', 'João 3:16')).rejects.toThrow(StudyInputError);
  });
});
