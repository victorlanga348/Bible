// @vitest-environment node
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('retains the admitted historical bytes, complete notice and genuine canonical selection', () => {
  const expected = {
    'canon.json': '66d6ff2f920a6dc55a02f0c879001f5a30867b40bb38634b854e3e1f6bff5e36',
    'source-excerpts.json': '79228666d0b6d552d6a5dc7ac3072acb7781c73f63af54119dab1495abff92d8',
    'source-manifest.json': '46469116db968afc44f32d4e6cc5fecc5890910c038cbaac5363aa80dacb66d4',
    'NOTICE.source.txt': '18bc5c6f86b23ade32c4d711e765328b0c642c383a993c8d7f11c7ee21da4bf1',
  };
  for (const [file, digest] of Object.entries(expected)) {
    const bytes = readFileSync(`src/test/fixtures/${file}`);
    expect(createHash('sha256').update(bytes).digest('hex'), file).toBe(digest);
  }
});
