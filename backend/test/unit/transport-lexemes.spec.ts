import { studyQuery, createStudyBody } from '../../src/modules/study/presentation/schemas';
import { rangeQuery, bookParams } from '../../src/modules/biblical-canon/presentation/schemas';
import { excerptQuery, excerptParams } from '../../src/modules/source-library/presentation/schemas';

describe('strict transport lexemes preserve the complete input string', () => {
  const cases = [
    { name: 'study version', schema: studyQuery, input: (ending: string) => ({ version: '1'+ending }) },
    { name: 'study translation', schema: createStudyBody, input: (ending: string) => ({ translationId: 'porbr2018'+ending, reference: 'GEN 1:1' }) },
    { name: 'canonical range', schema: rangeQuery, input: (ending: string) => ({ from: '1'+ending, to: '1' }) },
    { name: 'canonical code', schema: bookParams, input: (ending: string) => ({ translationId: 'porbr2018', bookCode: 'GEN'+ending }) },
    { name: 'source offset', schema: excerptQuery, input: (ending: string) => ({ offset: '0'+ending }) },
    { name: 'source limit', schema: excerptQuery, input: (ending: string) => ({ limit: '1'+ending }) },
    { name: 'source excerpt', schema: excerptParams, input: (ending: string) => ({ excerptId: 'genuine-excerpt'+ending }) },
  ];
  it.each(cases.flatMap(entry => ['\n', '\r', '\r\n', '\u2028', '\u2029'].map(ending => ({ ...entry, ending }))))('refuses final terminator $ending in $name', ({ schema, input, ending }) => {
    expect(schema.safeParse(input(ending)).success).toBe(false);
  });
  it('preserves valid decimal boundaries and existing source identifier grammar', () => {
    expect(studyQuery.parse({ version: '1' })).toEqual({ version: 1 });
    expect(studyQuery.parse({ version: String(Number.MAX_SAFE_INTEGER) })).toEqual({ version: Number.MAX_SAFE_INTEGER });
    expect(excerptQuery.parse({ offset: '0', limit: '50' })).toMatchObject({ offset: 0, limit: 50 });
    expect(excerptParams.parse({ excerptId: '-existing-source-id' }).excerptId).toBe('-existing-source-id');
    expect(createStudyBody.parse({ translationId: '0valid-edition', reference: 'GEN 1:1' }).translationId).toBe('0valid-edition');
  });
});
