import { readFileSync } from 'node:fs';
import { bookParams, booksView, errorView, rangeQuery, translationView } from '../../src/modules/biblical-canon/presentation/schemas';

// Genuine metadata, parsed without constructing domain entities at collection.
const manifest = JSON.parse(readFileSync('test/fixtures/biblical-canon/porbr2018/manifest.json', 'utf8')) as { translation: Record<string, unknown> };
describe('canonical transport boundary with genuine edition metadata', () => {
  it.each([' porbr2018', 'porbr2018!', 'UPPER', ''])('rejects malformed output edition identity %j', id => {
    expect(translationView.safeParse({ ...manifest.translation, id }).success).toBe(false);
  });
  it.each(['xGEN', 'GENx', 'gen', ''])('rejects a noncanonical output book code %j', code => {
    expect(booksView.safeParse({ books: [{ code, name: 'Gênesis', order: 1, chapterCount: 1 }] }).success).toBe(false);
  });
  it('normalises input codes and validates range pairs independently of application checks', () => {
    expect(bookParams.parse({ translationId: 'porbr2018', bookCode: 'jhn' }).bookCode).toBe('JHN');
    expect(rangeQuery.parse({})).toEqual({});
    expect(rangeQuery.parse({ from: '16', to: '18' })).toEqual({ from: 16, to: 18 });
    for (const value of [{ from: '16' }, { to: '18' }, { from: '18', to: '16' }]) expect(rangeQuery.safeParse(value).success).toBe(false);
  });
  it('requires exact public error fields and rejects empty or extra objects', () => {
    const schema = errorView('NOT_FOUND', 'Recurso não encontrado.');
    expect(schema.parse({ error: { code: 'NOT_FOUND', message: 'Recurso não encontrado.' } })).toEqual({ error: { code: 'NOT_FOUND', message: 'Recurso não encontrado.' } });
    for (const value of [{}, { error: {} }, { error: { code: 'OTHER', message: 'Recurso não encontrado.' } }, { error: { code: 'NOT_FOUND', message: 'wrong' } }, { error: { code: 'NOT_FOUND', message: 'Recurso não encontrado.', private: true } }]) expect(schema.safeParse(value).success).toBe(false);
  });
});
