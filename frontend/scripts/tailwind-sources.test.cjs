const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');

test('test-only class names cannot enter the production stylesheet', () => {
  const root = path.resolve(__dirname, '..');
  const probe = path.join(root, 'src/test/t006-tailwind-probe.fixture.ts');
  const content = 'export const technicalProbe = "text-[123.456px]";\n';
  // Exclusive creation avoids replacing any user file; cleanup only removes our exact bytes.
  fs.writeFileSync(probe, content, { flag: 'wx' });
  try {
    const build = cp.spawnSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build'], { cwd: root, encoding: 'utf8', timeout: 60000, windowsHide: true });
    assert.equal(build.status, 0, build.stderr);
    const assets = path.join(root, 'dist/assets');
    const styles = fs.readdirSync(assets).filter(name => name.endsWith('.css')).map(name => fs.readFileSync(path.join(assets, name), 'utf8')).join('\n');
    assert.match(styles, /\.flex\{display:flex\}/, 'Production utility classes must still be generated');
    assert.match(styles, /\.min-w-0\{min-width:0\}/, 'Responsive layout constraints must be retained');
    assert.doesNotMatch(styles, /123\.456px/, 'A class used exclusively in a test entered the production CSS');
  } finally {
    assert.equal(fs.readFileSync(probe, 'utf8'), content, 'Probe ownership changed');
    fs.unlinkSync(probe);
  }
});
