// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
const { verifyFrontendMutationReport } = createRequire(import.meta.url)('../../scripts/check-mutation.cjs');

// Adversarial technical report fixtures only; these are not actual Stryker results.
function fixture(killed = 86) {
  const source = Array.from({ length: 100 }, (_, index) => `const item${index} = true;`).join('\n');
  const mutants = Array.from({ length: 100 }, (_, index) => ({
    id: String(index), mutatorName: 'BooleanLiteral', replacement: 'false',
    location: { start: { line: index + 1, column: 1 }, end: { line: index + 1, column: 2 } },
    status: index < killed ? 'Killed' : 'Survived',
  }));
  return {
    report: { files: { 'src/technical.ts': { source, mutants } } },
    expected: { 'src/technical.ts': { source, mutants: structuredClone(mutants) } },
  };
}
describe('frontend mutation artifact gate', () => {
  it('accepts only a complete source and inventory with a score strictly above 85', () => {
    const { report, expected } = fixture();
    expect(verifyFrontendMutationReport(report, expected)).toEqual({ detected: 86, valid: 100, score: 86 });
  });
  it('rejects exactly 85 before rounding', () => {
    const { report, expected } = fixture(85);
    expect(() => verifyFrontendMutationReport(report, expected)).toThrow('Mutation score must be strictly greater than 85%');
  });
  it('rejects NoCoverage even when the aggregate numeric score would pass', () => {
    const { report, expected } = fixture();
    report.files['src/technical.ts'].mutants[99]!.status = 'NoCoverage';
    expect(() => verifyFrontendMutationReport(report, expected)).toThrow('NoCoverage');
  });
  it('does not count runtime errors as detection', () => {
    const { report, expected } = fixture();
    report.files['src/technical.ts'].mutants[0]!.status = 'RuntimeError';
    expect(() => verifyFrontendMutationReport(report, expected)).toThrow('Incomplete mutation report');
  });
  it('rejects absent source files instead of approving a smaller scope', () => {
    const { expected } = fixture();
    expect(() => verifyFrontendMutationReport({ files: {} }, expected)).toThrow('Mutation file inventory differs');
  });
  it('rejects a report for stale source', () => {
    const { report, expected } = fixture();
    report.files['src/technical.ts'].source += '\nconst changed = true;';
    expect(() => verifyFrontendMutationReport(report, expected)).toThrow('Mutation source differs');
  });
  it('rejects a missing mutant', () => {
    const { report, expected } = fixture(); report.files['src/technical.ts'].mutants.pop();
    expect(() => verifyFrontendMutationReport(report, expected)).toThrow('Mutation signatures differ');
  });
  it('rejects altered signatures without changing the inventory count', () => {
    const { report, expected } = fixture(); report.files['src/technical.ts'].mutants[0]!.replacement = 'true';
    expect(() => verifyFrontendMutationReport(report, expected)).toThrow('Mutation signatures differ');
  });
  it('rejects an empty denominator', () => {
    const empty = { files: {} }; expect(() => verifyFrontendMutationReport(empty, {})).toThrow('No valid mutants');
  });
  it('excludes CompileError from the denominator and preserves Timeout as detected', () => {
    const { report, expected } = fixture(86);
    report.files['src/technical.ts'].mutants[0]!.status = 'CompileError';
    report.files['src/technical.ts'].mutants[1]!.status = 'Timeout';
    expect(verifyFrontendMutationReport(report, expected)).toEqual({ detected: 85, valid: 99, score: 100 * 85 / 99 });
  });
});
