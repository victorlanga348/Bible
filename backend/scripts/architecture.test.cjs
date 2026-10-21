const { test } = require('node:test');
const assert = require('node:assert/strict');
const { checkDependencies } = require('./check-architecture.cjs');

test('allows an independent domain and ports in application', () => {
  assert.deepEqual(checkDependencies({
    'modules/canon/domain/book.ts': 'export interface Book { name: string }',
    'modules/canon/application/read.ts': "import type { Book } from '../domain/book';",
  }), []);
});
test('rejects framework/persistence/provider imports in domain', () => {
  for (const external of ['@nestjs/common', '@prisma/client', 'zod', 'openai', 'node:fs']) {
    assert.equal(checkDependencies({ 'modules/canon/domain/book.ts': `import { value } from '${external}';` }).length, 1);
  }
});
test('rejects application imports from infrastructure or presentation', () => {
  for (const external of ['../infrastructure/db', '../presentation/controller', '@nestjs/common', '@prisma/client']) {
    assert.equal(checkDependencies({ 'modules/canon/application/read.ts': `import { value } from '${external}';` }).length, 1);
  }
});
test('rejects direct cross-module infrastructure imports', () => {
  assert.equal(checkDependencies({
    'modules/study/application/read.ts': "import { Db } from '../../canon/infrastructure/db';",
  }).length, 1);
});
test('rejects layer barrels as well as deep implementation imports', () => {
  for (const layer of ['infrastructure', 'presentation']) {
    const errors = checkDependencies({ 'modules/canon/application/read.ts': `export * from '../${layer}';` });
    assert.equal(errors.length, 1);
  }
});
test('detects import cycles and does not mistake comments for imports', () => {
  const errors = checkDependencies({
    'modules/canon/domain/a.ts': "import { b } from './b';",
    'modules/canon/domain/b.ts': "import { a } from './a';",
    'modules/canon/domain/c.ts': "// import { x } from '@nestjs/common';",
  });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /cycle/);
});
test('checks real source files', () => {
  const { readdirSync, readFileSync } = require('node:fs');
  const { join, relative } = require('node:path');
  function collect(folder) {
    return readdirSync(folder, { withFileTypes: true }).flatMap((e) => {
      const name = join(folder, e.name);
      if (e.name === 'generated') return [];
      return e.isDirectory() ? collect(name) : name.endsWith('.ts') ? [name] : [];
    });
  }
  const files = Object.fromEntries(collect('src').map((p) => [relative('src', p).replaceAll('\\', '/'), readFileSync(p, 'utf8')]));
  assert.deepEqual(checkDependencies(files), []);
});
