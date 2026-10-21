import { readFileSync } from 'node:fs';
import { SourceDomainError } from '../../../src/modules/source-library/domain/source-domain-error';
import { SourcePermissions, type PermissionStatus, type SourcePermissionProps } from '../../../src/modules/source-library/domain/source-permissions';

const { source } = JSON.parse(readFileSync('test/fixtures/source-library/josephus-antiquities-pg2848-en/manifest.json', 'utf8')) as { source: { permissions: SourcePermissionProps } };
const base = source.permissions;
const statuses: PermissionStatus[] = ['allowed', 'pending', 'denied'];
const keys = ['ingest', 'store', 'index', 'display', 'quote', 'sendToAi'] as const;

describe('permissions are independent decisions for each operation', () => {
  it('preserves the admitted local permissions without granting AI use', () => {
    const permissions = new SourcePermissions(base);
    expect({ ...permissions }).toEqual(base);
    expect(permissions.sendToAi).toBe('pending');
    expect(permissions.canIngest()).toBe(true);
    expect(permissions.canRead()).toBe(true);
    expect(permissions.canSearch()).toBe(true);
  });
  it.each(statuses.flatMap(ingest => statuses.map(store => [ingest, store] as const)))('ingest=%s store=%s: both authorisations are required', (ingest, store) => {
    expect(new SourcePermissions({ ...base, ingest, store }).canIngest()).toBe(ingest === 'allowed' && store === 'allowed');
  });
  it.each(statuses.flatMap(display => statuses.map(quote => [display, quote] as const)))('display=%s quote=%s: both authorisations are required for reading', (display, quote) => {
    expect(new SourcePermissions({ ...base, display, quote }).canRead()).toBe(display === 'allowed' && quote === 'allowed');
  });
  it.each(statuses.flatMap(index => statuses.flatMap(display => statuses.map(quote => [index, display, quote] as const))))('index=%s display=%s quote=%s: search cannot expose ineligible text', (index, display, quote) => {
    expect(new SourcePermissions({ ...base, index, display, quote }).canSearch()).toBe(index === 'allowed' && display === 'allowed' && quote === 'allowed');
  });
  it.each(statuses)('AI permission %s cannot grant or revoke unrelated local permissions', sendToAi => {
    const eligible = new SourcePermissions({ ...base, sendToAi });
    expect([eligible.canRead(), eligible.canSearch(), eligible.canIngest()]).toEqual([true, true, true]);
    const ineligible = new SourcePermissions({ ...base, ingest: 'denied', store: 'pending', index: 'denied', display: 'pending', quote: 'denied', sendToAi });
    expect([ineligible.canRead(), ineligible.canSearch(), ineligible.canIngest()]).toEqual([false, false, false]);
  });
  it('ingestion permission cannot grant reading and reading does not grant ingestion', () => {
    const unreadable = new SourcePermissions({ ...base, display: 'denied' });
    expect(unreadable.canIngest()).toBe(true);
    expect(unreadable.canRead()).toBe(false);
    const unimportable = new SourcePermissions({ ...base, ingest: 'pending', store: 'denied' });
    expect(unimportable.canRead()).toBe(true);
    expect(unimportable.canSearch()).toBe(true);
    expect(unimportable.canIngest()).toBe(false);
  });
  it.each(keys.flatMap(key => ['', 'ALLOWED', 'unknown', undefined].map(value => [key, value] as const)))('requires a known explicit decision for %s=%s', (key, value) => {
    expect(() => new SourcePermissions({ ...base, [key]: value } as SourcePermissionProps)).toThrow(SourceDomainError);
  });
  it('cannot be altered through the input object or a later write to grant forbidden use', () => {
    const input = { ...base, quote: 'denied' as const } as SourcePermissionProps;
    const permissions = new SourcePermissions(input);
    Reflect.set(input, 'quote', 'allowed');
    Reflect.set(permissions, 'quote', 'allowed');
    expect(permissions.quote).toBe('denied');
    expect(permissions.canRead()).toBe(false);
  });
});
