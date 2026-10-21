import { readFileSync } from 'node:fs';
import { Source, type SourceProps, type SourceKind } from '../../../src/modules/source-library/domain/source';
import { SourceDomainError } from '../../../src/modules/source-library/domain/source-domain-error';

const { source: base } = JSON.parse(readFileSync('test/fixtures/source-library/josephus-antiquities-pg2848-en/manifest.json', 'utf8')) as { source: SourceProps };

describe('source preserves the admitted edition, provenance and limitations', () => {
  it('retains the real metadata and permission decisions exactly', () => {
    expect(JSON.parse(JSON.stringify(new Source(base)))).toEqual(base);
  });
  it('represents an unidentified translator as null rather than inventing a name', () => {
    expect(new Source({ ...base, translator: null }).translator).toBeNull();
  });
  it.each(['historical-work', 'modern-study', 'commentary'] as SourceKind[])('accepts declared classification %s without declaring historical truth', kind => {
    expect(new Source({ ...base, kind }).kind).toBe(kind);
  });
  it.each(['', 'historical-truth', undefined])('rejects unsupported classification %s', kind => {
    expect(() => new Source({ ...base, kind } as SourceProps)).toThrow(SourceDomainError);
  });
  it.each(['title', 'author', 'translator', 'language', 'edition', 'rightsStatement', 'attribution', 'limitations'] as const)('rejects empty %s', key => {
    for (const value of ['', ' \t\n']) expect(() => new Source({ ...base, [key]: value })).toThrow(SourceDomainError);
  });
  it.each(['', 'Josefo', 'with_space', 'with space', 'josé', 'source\n'])('rejects an invalid ASCII lowercase source identity %s', id => {
    expect(() => new Source({ ...base, id })).toThrow(SourceDomainError);
  });
  it.each(['originUrl', 'rightsUrl'] as const)('requires a valid absolute %s', key => {
    for (const value of ['', 'not-a-url', '/relative', 'https://']) expect(() => new Source({ ...base, [key]: value })).toThrow(SourceDomainError);
  });
  it('requires a valid retrieval date', () => {
    for (const retrievedAt of ['', 'not-a-date']) expect(() => new Source({ ...base, retrievedAt })).toThrow(SourceDomainError);
  });
  it.each(['', 'a'.repeat(63), 'a'.repeat(65), 'g'.repeat(64), 'a'.repeat(63) + '\n'])('requires a hexadecimal SHA-256 snapshot identity', snapshotSha256 => {
    expect(() => new Source({ ...base, snapshotSha256 })).toThrow(SourceDomainError);
  });
  it('preserves valid uppercase hexadecimal checksum data', () => {
    const snapshotSha256 = base.snapshotSha256.toUpperCase();
    expect(new Source({ ...base, snapshotSha256 }).snapshotSha256).toBe(snapshotSha256);
  });
  it('rejects an invalid nested permission rather than treating it as permission', () => {
    expect(() => new Source({ ...base, permissions: { ...base.permissions, index: 'unknown' } } as unknown as SourceProps)).toThrow(SourceDomainError);
  });
  it('keeps pending curation explicit and ineligible', () => {
    const permissions = { ingest: 'pending', store: 'pending', index: 'pending', display: 'pending', quote: 'pending', sendToAi: 'pending' } as const;
    const source = new Source({ ...base, permissions });
    expect(source.permissions.canIngest()).toBe(false);
    expect(source.permissions.canRead()).toBe(false);
    expect(source.permissions.canSearch()).toBe(false);
  });
  it('cannot be invalidated or granted new permissions by mutating inputs or the validated entity', () => {
    const input = { ...base, permissions: { ...base.permissions } };
    const source = new Source(input);
    Reflect.set(input, 'snapshotSha256', '');
    Reflect.set(input.permissions, 'sendToAi', 'allowed');
    Reflect.set(source, 'id', '');
    Reflect.set(source.permissions, 'sendToAi', 'allowed');
    expect(source.id).toBe(base.id);
    expect(source.snapshotSha256).toBe(base.snapshotSha256);
    expect(source.permissions.sendToAi).toBe('pending');
  });
});
